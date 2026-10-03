import type { InputService } from "@engine/inputs/input.service";
import { MouseButton } from "@engine/inputs/mouse";
import { Widget } from "@ui/widget";

export class Button extends Widget {
    private text: string;
    private font: string = "16px Arial";
    private textColor: string = "white";
    private backgroundColor: string = "blue";
    private onClick: () => void = () => {};

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,

        text: string,
        font: string = "16px Arial",
        textColor: string = "white",
        backgroundColor: string = "blue",
    ) {
        super(x, y, width, height);
        this.text = text;
        this.font = font;
        this.textColor = textColor;
        this.backgroundColor = backgroundColor;
    }

    setOnClick(onClick: () => void) {
        this.onClick = onClick;
    }

    update(input: InputService): void {
        const mouse = input.getMousePosition();
        if (mouse.x >= this.x && mouse.x <= this.x + this.width && mouse.y >= this.y && mouse.y <= this.y + this.height) {
            this.backgroundColor = "red";
            if (input.isMousePressed(MouseButton.LEFT)) {
                this.onClick();
            }
        } else {
            this.backgroundColor = "blue";
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.textColor;
        ctx.font = this.font;
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}