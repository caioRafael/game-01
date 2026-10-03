export enum Anchor {
    TOP_LEFT = "top-left",
    TOP_CENTER = "top-center",
    TOP_RIGHT = "top-right",
    MIDDLE_LEFT = "middle-left",
    CENTER = "center",
    MIDDLE_RIGHT = "middle-right",
    BOTTOM_LEFT = "bottom-left",
    BOTTOM_CENTER = "bottom-center",
    BOTTOM_RIGHT = "bottom-right",
}

function factor(anchor: Anchor): { x: number; y: number } {
    switch (anchor) {
        case Anchor.TOP_LEFT:
            return { x: 0, y: 0 };
        case Anchor.TOP_CENTER:
            return { x: 0.5, y: 0 };
        case Anchor.TOP_RIGHT:
            return { x: 1, y: 0 };
        case Anchor.MIDDLE_LEFT:
            return { x: 0, y: 0.5 };
        case Anchor.CENTER:
            return { x: 0.5, y: 0.5 };
        case Anchor.MIDDLE_RIGHT:
            return { x: 1, y: 0.5 };
        case Anchor.BOTTOM_LEFT:
            return { x: 0, y: 1 };
        case Anchor.BOTTOM_CENTER:
            return { x: 0.5, y: 1 };
        case Anchor.BOTTOM_RIGHT:
            return { x: 1, y: 1 };
    }
}

export function resolveAnchor(
    anchor: Anchor,
    parentX: number,
    parentY: number,
    parentWidth: number,
    parentHeight: number,
    width: number,
    height: number,
    offsetX: number,
    offsetY: number,
): { x: number; y: number } {
    const point = factor(anchor);
    const anchorX = parentX + parentWidth * point.x;
    const anchorY = parentY + parentHeight * point.y;
    return {
        x: anchorX - width * point.x + offsetX,
        y: anchorY - height * point.y + offsetY,
    };
}
