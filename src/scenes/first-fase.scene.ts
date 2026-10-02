import { Key } from "../engine/inputs/key";
import type { InputService } from "../engine/inputs/input.service";
import { Scene, type GameContext } from "../entities/scene";

export class FirstFaseScene extends Scene {
    private x = 0;
    private y = 0;
    private placed = false;
    private readonly speed = 240;

    update(dt: number, input: InputService, _game: GameContext): void {
        if (!this.placed) return;

        if (input.isPressed(Key.LEFT)) this.x -= this.speed * dt;
        if (input.isPressed(Key.RIGHT)) this.x += this.speed * dt;
        if (input.isPressed(Key.UP)) this.y -= this.speed * dt;
        if (input.isPressed(Key.DOWN)) this.y += this.speed * dt;
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        if (!this.placed) {
            this.x = width / 2;
            this.y = height / 2;
            this.placed = true;
        }

        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, 100, 100);
    }
}
