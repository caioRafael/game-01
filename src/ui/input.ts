import type { InputService } from "@engine/inputs/input.service";
import { MouseButton } from "@engine/inputs/mouse";
import { Widget } from "./widget";

export class Input extends Widget {
    private value: string = "";
    private font: string = "16px Arial";
    private color: string = "black";
    private focused = false;
    private wasMouseDown = false;

    constructor(x: number, y: number, width: number, height: number, font: string = "16px Arial", color: string = "black") {
        super(x, y, width, height);
        this.font = font;
        this.color = color;
    }

    getValue(): string {
        return this.value;
    }

    isFocused(): boolean {
        return this.focused;
    }

    update(input: InputService): void {
        const mouseDown = input.isMousePressed(MouseButton.LEFT);
        const mouse = input.getMousePosition();

        if (mouseDown && !this.wasMouseDown) {
            this.focused = this.contains(mouse.x, mouse.y);
        }
        this.wasMouseDown = mouseDown;

        if (!this.focused) {
            return;
        }

        for (const key of input.consumeTypedKeys()) {
            if (key === "Backspace") {
                this.value = this.value.slice(0, -1);
                continue;
            }
            this.value += key;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.focused) {
            ctx.strokeStyle = "blue";
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.clip();
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.textBaseline = "middle";
        ctx.fillText(this.value, this.x + 8, this.y + this.height / 2);
        ctx.restore();
    }
}