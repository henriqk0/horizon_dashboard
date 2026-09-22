import { describe, expect, it } from "vitest";

import {
    cleanupLegacyAccessibilityKeys,
    LEGACY_ACCESSIBILITY_KEYS,
    readThemePreference,
    resolveTheme,
    THEME_PREFERENCE_KEY,
    USERWAY_ACCOUNT_ID,
} from "../src/lib/accessibility-settings";

/**
 * Espelho do script inline do `<head>` de `Layout.astro` (TASK-004).
 *
 * Deve reproduzir exatamente a lógica do script real. O teste de paridade abaixo garante que
 * o espelho e `resolveTheme` produzem os mesmos outputs — detecta divergência de defaults.
 * Se o script do `<head>` mudar, atualize este espelho E o script.
 */
const headMirrorResolveTheme = (
    preference: string | null | undefined,
    systemPrefersDark: boolean,
): "light" | "dark" => {
    const pref = preference || "auto";
    let theme: "light" | "dark" | "auto" = pref === "light" || pref === "dark" ? pref : "auto";
    if (theme === "auto") {
        theme = systemPrefersDark ? "dark" : "light";
    }
    return theme;
};

type MockStorage = {
    getItem: (key: string) => string | null;
    removeItem: (key: string) => void;
    dump: () => Record<string, string>;
};

const createMockStorage = (initial: Record<string, string> = {}): MockStorage => {
    const store = new Map(Object.entries(initial));
    return {
        getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
        removeItem: (key: string) => {
            store.delete(key);
        },
        dump: () => Object.fromEntries(store.entries()),
    };
};

describe("resolveTheme", () => {
    it('devolve "light" para preferência explícita "light"', () => {
        expect(resolveTheme("light", true)).toBe("light");
        expect(resolveTheme("light", false)).toBe("light");
    });

    it('devolve "dark" para preferência explícita "dark"', () => {
        expect(resolveTheme("dark", false)).toBe("dark");
        expect(resolveTheme("dark", true)).toBe("dark");
    });

    it('em "auto" segue o sistema: escuro quando o sistema está escuro', () => {
        expect(resolveTheme("auto", true)).toBe("dark");
    });

    it('em "auto" segue o sistema: claro quando o sistema está claro', () => {
        expect(resolveTheme("auto", false)).toBe("light");
    });

    it("tem paridade com o espelho do <head> para todas as combinações", () => {
        const preferences = ["light", "dark", "auto"] as const;
        const systemModes = [true, false];

        for (const preference of preferences) {
            for (const systemPrefersDark of systemModes) {
                expect(headMirrorResolveTheme(preference, systemPrefersDark)).toBe(
                    resolveTheme(preference, systemPrefersDark),
                );
            }
        }
    });

    it("default ausente do espelho equivale a auto em resolveTheme", () => {
        // O <head> faz `localStorage.getItem("theme-preference") || "auto"`.
        expect(headMirrorResolveTheme(null, true)).toBe(resolveTheme("auto", true));
        expect(headMirrorResolveTheme(undefined, false)).toBe(resolveTheme("auto", false));
    });
});

describe("readThemePreference", () => {
    it('faz default para "auto" quando nenhuma preferência está gravada', () => {
        const storage = createMockStorage();
        expect(readThemePreference(storage)).toBe("auto");
    });

    it("lê preferência gravada light/dark/auto", () => {
        for (const pref of ["light", "dark", "auto"]) {
            const storage = createMockStorage({ [THEME_PREFERENCE_KEY]: pref });
            expect(readThemePreference(storage)).toBe(pref);
        }
    });

    it('ignora valores desconhecidos e faz default para "auto"', () => {
        const storage = createMockStorage({ [THEME_PREFERENCE_KEY]: "sepia" });
        expect(readThemePreference(storage)).toBe("auto");
    });
});

describe("USERWAY_ACCOUNT_ID", () => {
    it("é uma string não vazia (ID público fixo no código)", () => {
        expect(typeof USERWAY_ACCOUNT_ID).toBe("string");
        expect(USERWAY_ACCOUNT_ID.length).toBeGreaterThan(0);
    });
});

describe("LEGACY_ACCESSIBILITY_KEYS", () => {
    it("lista exatamente as 7 chaves órfãs do painel antigo", () => {
        expect([...LEGACY_ACCESSIBILITY_KEYS]).toEqual([
            "contrast",
            "text-scale",
            "reduce-motion",
            "enhanced-focus",
            "screen-reader-optimized",
            "high-contrast",
            "theme",
        ]);
    });

    it("não inclui a chave atual do tema (theme-preference)", () => {
        expect(LEGACY_ACCESSIBILITY_KEYS).not.toContain(THEME_PREFERENCE_KEY);
    });
});

describe("cleanupLegacyAccessibilityKeys", () => {
    it("remove todas as chaves legadas presentes e retorna quais foram removidas", () => {
        const storage = createMockStorage({
            contrast: "high",
            "text-scale": "xl",
            "reduce-motion": "true",
            "enhanced-focus": "true",
            "screen-reader-optimized": "true",
            "high-contrast": "true",
            theme: "dark",
        });

        const removed = cleanupLegacyAccessibilityKeys(storage);

        expect(removed.sort()).toEqual([...LEGACY_ACCESSIBILITY_KEYS].sort());
        expect(storage.dump()).toEqual({});
    });

    it("é idempotente: a segunda chamada não encontra nada para remover", () => {
        const storage = createMockStorage({
            contrast: "maximum",
            theme: "light",
        });

        cleanupLegacyAccessibilityKeys(storage);
        const secondRun = cleanupLegacyAccessibilityKeys(storage);

        expect(secondRun).toEqual([]);
        expect(storage.dump()).toEqual({});
    });

    it("nada a remover quando as chaves não existem", () => {
        const storage = createMockStorage({ [THEME_PREFERENCE_KEY]: "dark" });
        expect(cleanupLegacyAccessibilityKeys(storage)).toEqual([]);
        // A chave corrente do tema permanece intacta.
        expect(storage.dump()).toEqual({ [THEME_PREFERENCE_KEY]: "dark" });
    });

    it("tolera localStorage indisponível (getItem lançando)", () => {
        const throwingStorage = {
            getItem: () => {
                throw new Error("SecurityError: acesso negado");
            },
            removeItem: () => {
                throw new Error("SecurityError: acesso negado");
            },
        };

        expect(() => cleanupLegacyAccessibilityKeys(throwingStorage)).not.toThrow();
        expect(cleanupLegacyAccessibilityKeys(throwingStorage)).toEqual([]);
    });

    it("continua removendo as demais chaves quando uma falha no meio", () => {
        const base = createMockStorage({
            contrast: "high",
            "reduce-motion": "true",
        });
        const flaky = {
            getItem: (key: string) => (key === "text-scale" ? null : base.getItem(key)),
            removeItem: (key: string) =>
                key === "text-scale" ? undefined : base.removeItem(key),
        };

        const removed = cleanupLegacyAccessibilityKeys(flaky);
        expect(removed).toContain("contrast");
        expect(base.dump()).toEqual({});
    });
});