import type { InputService } from "@engine/inputs/input.service";
import { Widget } from "./widget";

export class Panel extends Widget {
    private backgroundColor: string = "white";
    private children: { widget: Widget, x: number, y: number }[] = [];

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

    addChild(child: Widget): void {
        this.children.push({
            widget: child,
            x: this.x + child.getPosition().x,
            y: this.y + child.getPosition().y,
        });
    }

    layout(): void {
        for (const child of this.children) {
            child.widget.setPosition(child.x, child.y);
        }
    }

    update(input: InputService): void {
       this.layout();
       for (const child of this.children) {
        child.widget.update(input);
       }
    }

    private renderChildren(ctx: CanvasRenderingContext2D): void {
        for (const child of this.children) {
            child.widget.render(ctx);
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        this.layout();
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.renderChildren(ctx);
    }
}