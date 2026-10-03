import { Key } from "@engine/inputs/key";
import type { InputService } from "@engine/inputs/input.service";
import { Scene, type GameContext } from "@entities/scene";
import { FirstFaseScene } from "./first-fase.scene";
import { Label } from "@ui/label";
import { Button } from "@ui/button";

export class InitialScene extends Scene {
    private label: Label;
    private button: Button;


    constructor() {
        super();
        this.label = new Label(100, 100, 200, 50, "Hello, World!");
        this.button = new Button(100, 300, 200, 50, "New Game", "16px Arial", "white", "blue");
    }

    update(_dt: number, input: InputService, game: GameContext): void {
        if (input.isPressed(Key.SPACE)) {
            game.changeScene(new FirstFaseScene());
        }
        if (input.isPressed(Key.LEFT)) {
            game.changeScene(new InitialScene());
        }
        this.button.setOnClick(() => {
            game.changeScene(new FirstFaseScene());
        });
        this.button.update(input);
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.fillStyle = "red";
        ctx.fillRect((width / 2) - 25, (height / 2) - 25, 50, 50);
        this.label.render(ctx);
        this.button.render(ctx);
    }
}
