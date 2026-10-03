import type { InputService } from "@engine/inputs/input.service";
import { Widget } from "./widget";

export class Panel extends Widget {
    private backgroundColor: string = "white";

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        backgroundColor: string = "white",
    ) {
        super(x, y, width, height);
        this.backgroundColor = backgroundColor;
    }

    update(input: InputService): void {
        throw new Error("Method not implemented.");
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}