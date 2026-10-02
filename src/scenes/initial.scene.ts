import { Key } from "../engine/inputs/key";
import type { InputService } from "../engine/inputs/input.service";
import { Scene, type GameContext } from "../entities/scene";
import { FirstFaseScene } from "./first-fase.scene";

export class InitialScene extends Scene {

    update(_dt: number, input: InputService, game: GameContext): void {
        if (input.isPressed(Key.SPACE)) {
            game.changeScene(new FirstFaseScene());
        }
        if (input.isPressed(Key.LEFT)) {
            game.changeScene(new InitialScene());
        }
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.fillStyle = "red";
        ctx.fillRect((width / 2) - 25, (height / 2) - 25, 50, 50);
    }
}
