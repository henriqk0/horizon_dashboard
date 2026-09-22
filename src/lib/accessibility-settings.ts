/**
 * Configurações de acessibilidade do Horizon.
 *
 * Fonte única para a lógica extraível do antigo painel de acessibilidade
 * (`AccessibilityToggle.astro`, removido). O script inline do `<head>` de
 * `Layout.astro` mantém um espelho mínimo desta lógica (não é possível importar
 * módulos em script inline pré-paint) — o teste de paridade em
 * `tests/accessibility-settings.test.ts` garante que espelho e módulo não divergem.
 *
 * Decisões de produto (ver specs/accessibility-userway-widget/spec.md §5):
 * - D-1: o tema segue `light → dark → auto` no `ThemeToggle`.
 * - D-3: o ID do UserWay é público e fica fixo no código (sem variável de ambiente).
 */

export type ThemePreference = "light" | "dark" | "auto";

/** Chave corrente da preferência de tema (a única que permanece). */
export const THEME_PREFERENCE_KEY = "theme-preference";

/**
 * Chaves órfãs gravadas pelo painel antigo (`contrast`, `text-scale`,
 * `reduce-motion`, `enhanced-focus`, `screen-reader-optimized`) mais as duas
 * legadas da migração (`high-contrast`, `theme`). Nenhuma delas é lida pelo
 * site atual — a limpeza é idempotente e pode rodar a cada carregamento.
 */
export const LEGACY_ACCESSIBILITY_KEYS = [
    "contrast",
    "text-scale",
    "reduce-motion",
    "enhanced-focus",
    "screen-reader-optimized",
    "high-contrast",
    "theme",
] as const;

/**
 * ID público da conta UserWay. Não é segredo (aparece no HTML via
 * `data-account`), por isso fica fixo no código. Trocar de conta = editar aqui.
 * Enquanto estiver vazio, o widget não é emitido.
 */
export const USERWAY_ACCOUNT_ID = "Jmxwgqf2MY";

/**
 * Resolve a preferência de tema em um tema efetivo.
 *
 * - `"auto"` segue o sistema (`systemPrefersDark`).
 * - `"light"`/`"dark"` são aplicados diretamente.
 */
export function resolveTheme(
    preference: ThemePreference,
    systemPrefersDark: boolean,
): "light" | "dark" {
    if (preference === "auto") return systemPrefersDark ? "dark" : "light";
    return preference;
}

/**
 * Lê `theme-preference` do armazenamento com default `"auto"` (D-1).
 * Valores desconhecidos caem no default — tolera chave ausente ou corrompida.
 */
export function readThemePreference(
    storage: Pick<Storage, "getItem">,
): ThemePreference {
    const raw = storage.getItem(THEME_PREFERENCE_KEY);
    return raw === "light" || raw === "dark" || raw === "auto" ? raw : "auto";
}

/**
 * Remove as chaves legadas do painel antigo de acessibilidade.
 *
 * Idempotente: a segunda chamada não encontra nada para remover.
 * Tolera `getItem`/`removeItem` lançando (localStorage indisponível em alguns
 * contextos) — nesse caso a chave é ignorada e a limpeza segue.
 *
 * @returns as chaves efetivamente removidas.
 */
export function cleanupLegacyAccessibilityKeys(
    storage: Pick<Storage, "getItem" | "removeItem">,
): string[] {
    const removed: string[] = [];
    for (const key of LEGACY_ACCESSIBILITY_KEYS) {
        try {
            if (storage.getItem(key) !== null) {
                storage.removeItem(key);
                removed.push(key);
            }
        } catch {
            // Armazenamento indisponível ou lançando: ignora a chave e segue.
        }
    }
    return removed;
}