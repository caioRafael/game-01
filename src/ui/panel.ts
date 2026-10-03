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
        const position = child.getPosition();
        this.children.push({
            widget: child,
            x: position.x,
            y: position.y,
        });
    }

    place(parentX: number, parentY: number, parentWidth: number, parentHeight: number): void {
        super.place(parentX, parentY, parentWidth, parentHeight);
        this.placeChildren();
    }

    private placeChildren(): void {
        for (const child of this.children) {
            if (!child.widget.hasAnchor()) {
                child.widget.setPosition(this.x + child.x, this.y + child.y);
            }
            child.widget.place(this.x, this.y, this.width, this.height);
        }
    }

    update(input: InputService): void {
       this.placeChildren();
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
        this.placeChildren();
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.renderChildren(ctx);
    }
}