import { describe, expect, it } from "vitest";

import {
    CLARITY_PROJECT_ID,
    GA_MEASUREMENT_ID,
} from "../src/lib/analytics-settings";

describe("GA_MEASUREMENT_ID", () => {
    it("é uma string não vazia no formato G-* (ID público fixo no código)", () => {
        expect(typeof GA_MEASUREMENT_ID).toBe("string");
        expect(GA_MEASUREMENT_ID.length).toBeGreaterThan(0);
        expect(GA_MEASUREMENT_ID).toMatch(/^G-[A-Z0-9]+$/);
    });
});

describe("CLARITY_PROJECT_ID", () => {
    it("é uma string não vazia (ID público fixo no código)", () => {
        expect(typeof CLARITY_PROJECT_ID).toBe("string");
        expect(CLARITY_PROJECT_ID.length).toBeGreaterThan(0);
    });
});