import type { InputService } from "@engine/inputs/input.service";
import { Widget } from "@ui/widget";

export class Label extends Widget {
    private text: string;
    private font: string;
    private color: string;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        font: string = "16px Arial",
        color: string = "white",
    ) {
        super(x, y, width, height);
        this.text = text;
        this.font = font;
        this.color = color;
    }

    update(input: InputService): void {
        return;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.fillText(this.text, this.x, this.y);
    }
}