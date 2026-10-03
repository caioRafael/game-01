import { Key } from "@engine/inputs/key";
import type { InputService } from "@engine/inputs/input.service";
import { Scene, type GameContext } from "@entities/scene";
import { FirstFaseScene } from "./first-fase.scene";
import { Label } from "@ui/label";
import { Button } from "@ui/button";
import { Panel } from "@ui/panel";
import { Input } from "@ui/input";

export class InitialScene extends Scene {
    private label: Label;
    private button: Button;
    private panel: Panel;
    private label2: Label;
    private button2: Button;
    private textInput: Input;

    constructor() {
        super();
        this.label = new Label(100, 100, 200, 50, "Hello, World!");
        this.button = new Button(100, 300, 200, 50, "New Game", "16px Arial", "white", "blue");
        this.panel = new Panel(100, 400, 600, 200, "red");
        this.button2 = new Button(100, 100, 200, 50, "New Game", "16px Arial", "white", "blue");
        this.label2 = new Label(20, 50, 200, 50, "Hello, World!");
        this.textInput = new Input(270, 28, 200, 40);
        this.panel.addChild(this.label2);
        this.panel.addChild(this.button2);
        this.panel.addChild(this.textInput);
    }

    update(_dt: number, input: InputService, game: GameContext): void {
        if (input.isPressed(Key.SPACE) && !this.textInput.isFocused()) {
            game.changeScene(new FirstFaseScene());
        }
        if (input.isPressed(Key.LEFT)) {
            game.changeScene(new InitialScene());
        }
        this.button.setOnClick(() => {
            game.changeScene(new FirstFaseScene());
        });
        this.button.update(input);
        this.panel.update(input);
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.fillStyle = "red";
        ctx.fillRect((width / 2) - 25, (height / 2) - 25, 50, 50);
        this.label.render(ctx);
        this.button.render(ctx);
        this.panel.render(ctx);
    }
}
