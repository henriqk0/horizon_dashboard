import { describe, expect, it } from "vitest";
import {
    clampScale,
    getUnitsPerPixel,
    panFromDrag,
    screenPointToWorld,
    toTransformStyle,
    worldPointToScreen,
    type GraphPanZoomTransform,
} from "../src/lib/graph-pan-zoom";
import { zoomAtPointer } from "../src/lib/graph-pan-zoom";

const identityTransform: GraphPanZoomTransform = { x: 0, y: 0, scale: 1 };
const limits = { minScale: 0.2, maxScale: 5 };

describe("getUnitsPerPixel", () => {
    it("converts the viewBox width into user units per rendered pixel", () => {
        expect(getUnitsPerPixel(2000, 800)).toBe(2.5);
        expect(getUnitsPerPixel(960, 960)).toBe(1);
    });

    it("falls back to 1 when either dimension is missing or invalid", () => {
        expect(getUnitsPerPixel(0, 800)).toBe(1);
        expect(getUnitsPerPixel(2000, 0)).toBe(1);
        expect(getUnitsPerPixel(Number.NaN, 800)).toBe(1);
        expect(getUnitsPerPixel(2000, Number.POSITIVE_INFINITY)).toBe(1);
    });
});

describe("clampScale", () => {
    it("keeps the scale inside the configured range", () => {
        expect(clampScale(1.5, 0.2, 5)).toBe(1.5);
        expect(clampScale(0.05, 0.2, 5)).toBe(0.2);
        expect(clampScale(42, 0.2, 5)).toBe(5);
    });
});

describe("zoomAtPointer", () => {
    it("keeps the world point under the pointer anchored while zooming in", () => {
        const unitsPerPixel = 2.5;
        const pointer = { x: 320, y: 180 };
        const before = screenPointToWorld(identityTransform, pointer, unitsPerPixel);

        const zoomed = zoomAtPointer(
            identityTransform,
            pointer,
            1.1,
            unitsPerPixel,
            limits,
        );
        const after = screenPointToWorld(zoomed, pointer, unitsPerPixel);

        expect(zoomed.scale).toBeCloseTo(1.1, 10);
        expect(after.x).toBeCloseTo(before.x, 10);
        expect(after.y).toBeCloseTo(before.y, 10);
    });

    it("keeps the anchor for any units-per-pixel ratio and zoom direction", () => {
        const transform: GraphPanZoomTransform = { x: -140, y: 96, scale: 1.75 };
        const pointer = { x: 210, y: 640 };

        [0.5, 1, 1.85, 2.75].forEach((unitsPerPixel) => {
            [1.1, 1 / 1.1].forEach((zoomFactor) => {
                const before = screenPointToWorld(transform, pointer, unitsPerPixel);
                const zoomed = zoomAtPointer(
                    transform,
                    pointer,
                    zoomFactor,
                    unitsPerPixel,
                    limits,
                );
                const after = screenPointToWorld(zoomed, pointer, unitsPerPixel);

                expect(after.x).toBeCloseTo(before.x, 8);
                expect(after.y).toBeCloseTo(before.y, 8);
            });
        });
    });

    it("clamps the scale to the limits without breaking the anchor", () => {
        const transform: GraphPanZoomTransform = { x: 12, y: -8, scale: 4.9 };
        const pointer = { x: 100, y: 100 };
        const unitsPerPixel = 2;
        const before = screenPointToWorld(transform, pointer, unitsPerPixel);

        const zoomed = zoomAtPointer(transform, pointer, 4, unitsPerPixel, limits);
        const after = screenPointToWorld(zoomed, pointer, unitsPerPixel);

        expect(zoomed.scale).toBe(limits.maxScale);
        expect(after.x).toBeCloseTo(before.x, 8);
        expect(after.y).toBeCloseTo(before.y, 8);
    });

    it("does not mutate the transform it receives", () => {
        const transform: GraphPanZoomTransform = { x: 5, y: 6, scale: 1 };

        zoomAtPointer(transform, { x: 10, y: 10 }, 1.1, 3, limits);

        expect(transform).toEqual({ x: 5, y: 6, scale: 1 });
    });
});

describe("panFromDrag", () => {
    it("moves the graph exactly as far as the pointer travelled on screen", () => {
        const unitsPerPixel = 2.5;
        const worldPoint = { x: 100, y: 250 };
        const before = worldPointToScreen(identityTransform, worldPoint, unitsPerPixel);

        const panned = panFromDrag(identityTransform, 30, -45, unitsPerPixel);
        const after = worldPointToScreen(panned, worldPoint, unitsPerPixel);

        expect(after.x - before.x).toBeCloseTo(30, 10);
        expect(after.y - before.y).toBeCloseTo(-45, 10);
    });

    it("stays 1:1 with the pointer regardless of the current scale", () => {
        const transform: GraphPanZoomTransform = { x: 320, y: -40, scale: 3.2 };
        const unitsPerPixel = 1.85;
        const worldPoint = { x: -60, y: 12 };
        const before = worldPointToScreen(transform, worldPoint, unitsPerPixel);

        const panned = panFromDrag(transform, 120, 75, unitsPerPixel);
        const after = worldPointToScreen(panned, worldPoint, unitsPerPixel);

        expect(after.x - before.x).toBeCloseTo(120, 8);
        expect(after.y - before.y).toBeCloseTo(75, 8);
        expect(panned.scale).toBe(transform.scale);
    });
});

describe("toTransformStyle", () => {
    it("serializes the transform in user units", () => {
        expect(toTransformStyle({ x: 12.5, y: -3, scale: 1.25 })).toBe(
            "translate(12.5px, -3px) scale(1.25)",
        );
    });
});
