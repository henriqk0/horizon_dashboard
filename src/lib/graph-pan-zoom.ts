/**
 * Pan/zoom math for the SVG interaction graphs.
 *
 * The graphs apply `transform: translate(x, y) scale(s)` to a `<g>` inside the SVG. CSS lengths on
 * SVG children are resolved in the element's local coordinate system — user units of the viewBox —
 * not in screen pixels. Pointer events, on the other hand, always report CSS pixels.
 *
 * Every function here keeps the transform in user units and converts pointer input through
 * `unitsPerPixel`, so the two coordinate systems never leak into each other.
 */

export interface GraphPanZoomTransform {
    x: number;
    y: number;
    scale: number;
}

export interface GraphPanZoomPoint {
    x: number;
    y: number;
}

export interface GraphPanZoomLimits {
    minScale: number;
    maxScale: number;
}

const isUsableDimension = (value: number) => Number.isFinite(value) && value > 0;

/**
 * User units per rendered CSS pixel, i.e. the bridge between pointer coordinates and the
 * coordinate system the transform lives in. Falls back to `1` when either dimension is unusable,
 * which degrades to the previous (screen-pixel) behaviour instead of producing NaN.
 */
export const getUnitsPerPixel = (viewBoxWidth: number, renderedWidth: number): number =>
    isUsableDimension(viewBoxWidth) && isUsableDimension(renderedWidth)
        ? viewBoxWidth / renderedWidth
        : 1;

/** Restricts a scale to the configured range. */
export const clampScale = (scale: number, minScale: number, maxScale: number): number =>
    Math.min(maxScale, Math.max(minScale, scale));

/** Projects a screen point (CSS pixels) onto the untransformed graph coordinates. */
export const screenPointToWorld = (
    transform: GraphPanZoomTransform,
    pointer: GraphPanZoomPoint,
    unitsPerPixel: number,
): GraphPanZoomPoint => ({
    x: (pointer.x * unitsPerPixel - transform.x) / transform.scale,
    y: (pointer.y * unitsPerPixel - transform.y) / transform.scale,
});

/** Projects a graph coordinate back onto the screen, in CSS pixels. */
export const worldPointToScreen = (
    transform: GraphPanZoomTransform,
    point: GraphPanZoomPoint,
    unitsPerPixel: number,
): GraphPanZoomPoint => ({
    x: (point.x * transform.scale + transform.x) / unitsPerPixel,
    y: (point.y * transform.scale + transform.y) / unitsPerPixel,
});

/**
 * Scales around the pointer, keeping the graph coordinate under the cursor anchored in place.
 *
 * With the pointer at `p` user units (`pointer * unitsPerPixel`), the translation that preserves
 * the anchor is `p - (p - x) * scale' / scale`.
 */
export const zoomAtPointer = (
    transform: GraphPanZoomTransform,
    pointer: GraphPanZoomPoint,
    zoomFactor: number,
    unitsPerPixel: number,
    limits: GraphPanZoomLimits,
): GraphPanZoomTransform => {
    const nextScale = clampScale(
        transform.scale * zoomFactor,
        limits.minScale,
        limits.maxScale,
    );
    const scaleRatio = nextScale / transform.scale;
    const pointerX = pointer.x * unitsPerPixel;
    const pointerY = pointer.y * unitsPerPixel;

    return {
        x: pointerX - (pointerX - transform.x) * scaleRatio,
        y: pointerY - (pointerY - transform.y) * scaleRatio,
        scale: nextScale,
    };
};

/**
 * Translates the graph by a pointer displacement measured in CSS pixels, so the content tracks the
 * cursor exactly 1:1 on screen whatever the viewBox size is.
 *
 * `origin` is the transform captured when the drag started, not the running one, which keeps the
 * gesture free of accumulated rounding.
 */
export const panFromDrag = (
    origin: GraphPanZoomTransform,
    deltaScreenX: number,
    deltaScreenY: number,
    unitsPerPixel: number,
): GraphPanZoomTransform => ({
    x: origin.x + deltaScreenX * unitsPerPixel,
    y: origin.y + deltaScreenY * unitsPerPixel,
    scale: origin.scale,
});

/** Serializes the transform for `style.transform`, keeping the format in a single place. */
export const toTransformStyle = (transform: GraphPanZoomTransform): string =>
    `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
