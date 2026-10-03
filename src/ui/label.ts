import type { InputService } from "@engine/inputs/input.service";
import { TextAlign } from "@ui/button";
import { Widget } from "@ui/widget";

export class Label extends Widget {
    private text: string;
    private font: string;
    private color: string;
    private textAlign: TextAlign;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        font: string = "16px Arial",
        color: string = "white",
        textAlign: TextAlign = TextAlign.LEFT,
    ) {
        super(x, y, width, height);
        this.text = text;
        this.font = font;
        this.color = color;
        this.textAlign = textAlign;
    }

    update(input: InputService): void {
        return;
    }

    setText(text: string): void {
        this.text = text;
    }

    getText(): string {
        return this.text;
    }

    render(ctx: CanvasRenderingContext2D): void {
        const textX = this.textAlign === TextAlign.RIGHT
            ? this.x + this.width
            : this.textAlign === TextAlign.CENTER
                ? this.x + this.width / 2
                : this.x;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.fillText(this.text, textX, this.y);
        ctx.restore();
    }
}