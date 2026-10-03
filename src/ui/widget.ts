import type { InputService } from "@engine/inputs/input.service";
import { Anchor, resolveAnchor } from "./anchor";

export abstract class Widget {
    private anchor: Anchor | null = null;
    private offsetX = 0;
    private offsetY = 0;

    constructor(
        protected x: number,
        protected y: number,
        protected width: number,
        protected height: number,
    ){}

    contains(px: number, py: number): boolean {
        return px >= this.x && px <= this.x + this.width && py >= this.y && py <= this.y + this.height;
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    getPosition(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    setAnchor(anchor: Anchor, offsetX = 0, offsetY = 0): this {
        this.anchor = anchor;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        return this;
    }

    hasAnchor(): boolean {
        return this.anchor !== null;
    }

    place(parentX: number, parentY: number, parentWidth: number, parentHeight: number): void {
        if (this.anchor === null) return;
        const position = resolveAnchor(
            this.anchor,
            parentX,
            parentY,
            parentWidth,
            parentHeight,
            this.width,
            this.height,
            this.offsetX,
            this.offsetY,
        );
        this.x = position.x;
        this.y = position.y;
    }

    abstract update(input: InputService): void;

    abstract render(ctx: CanvasRenderingContext2D): void;
}