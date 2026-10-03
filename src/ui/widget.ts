import type { InputService } from "@engine/inputs/input.service";

export abstract class Widget {
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

    abstract update(input: InputService): void;

    abstract render(ctx: CanvasRenderingContext2D): void;
}