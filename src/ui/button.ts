import type { InputService } from "@engine/inputs/input.service";
import { MouseButton } from "@engine/inputs/mouse";
import { Widget } from "@ui/widget";

export enum TextAlign {
    LEFT = "left",
    CENTER = "center",
    RIGHT = "right",
}

export enum TextVerticalAlign {
    TOP = "top",
    MIDDLE = "middle",
    BOTTOM = "bottom",
}

export class Button extends Widget {
    private text: string;
    private font: string = "16px Arial";
    private textColor: string = "white";
    private backgroundColor: string = "blue";
    private textAlign: TextAlign = TextAlign.CENTER;
    private verticalAlign: TextVerticalAlign = TextVerticalAlign.MIDDLE;
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
        textAlign: TextAlign = TextAlign.CENTER,
        verticalAlign: TextVerticalAlign = TextVerticalAlign.MIDDLE,
    ) {
        super(x, y, width, height);
        this.text = text;
        this.font = font;
        this.textColor = textColor;
        this.backgroundColor = backgroundColor;
        this.textAlign = textAlign;
        this.verticalAlign = verticalAlign;
    }

    setOnClick(onClick: () => void) {
        this.onClick = onClick;
    }

    isHovered(input: InputService): boolean {
        const mouse = input.getMousePosition();
        return mouse.x >= this.x && mouse.x <= this.x + this.width && mouse.y >= this.y && mouse.y <= this.y + this.height;
    }

    update(input: InputService): void {
        if (this.isHovered(input)) {
            this.backgroundColor = "green";
            this.textColor = "blue";
            if (input.isMousePressed(MouseButton.LEFT)) {
                this.onClick();
            }
        } else {
            this.backgroundColor = "blue";
            this.textColor = "white";
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        const padding = 8;
        const textX = this.textAlign === TextAlign.LEFT
            ? this.x + padding
            : this.textAlign === TextAlign.RIGHT
                ? this.x + this.width - padding
                : this.x + this.width / 2;
        const textY = this.verticalAlign === TextVerticalAlign.TOP
            ? this.y + padding
            : this.verticalAlign === TextVerticalAlign.BOTTOM
                ? this.y + this.height - padding
                : this.y + this.height / 2;

        ctx.save();
        ctx.fillStyle = this.textColor;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.verticalAlign;
        ctx.fillText(this.text, textX, textY);
        ctx.restore();
    }
}