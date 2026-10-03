import type { InputService } from "@engine/inputs/input.service";
import { Scene, type GameContext } from "@entities/scene";
import { Player } from "@entities/player";
import { GameObject } from "@entities/game-object";
import { Collision } from "@engine/physics/collision";
import { InitialScene } from "./initial.scene";
import { MouseButton } from "@engine/inputs/mouse";
import { Anchor } from "@ui/anchor";
import { Button, TextAlign } from "@ui/button";
import { Label } from "@ui/label";

export class FirstFaseScene extends Scene {
    private x = 0;
    private y = 0;
    private placed = false;

    private doorColor = "blue";

    private backButton: Button = new Button(0, 0, 50, 50, "Back", "16px Arial", "white", "blue")
        .setAnchor(Anchor.TOP_LEFT, 20, 20);
    private label: Label = new Label(0, 0, 220, 32, "Player:", "16px Arial", "white", TextAlign.RIGHT)
        .setAnchor(Anchor.TOP_RIGHT, -16, 24);

    private player: Player = new Player(this.x, this.y, 100, 100); 
    private door: GameObject = new GameObject(this.x, this.y, 100, 100, this.doorColor, false);

    
    layout(width: number, height: number): void {
        this.backButton.place(0, 0, width, height);
        this.label.place(0, 0, width, height);
    }

    update(dt: number, input: InputService, game: GameContext): void {
        const playerPreviousPosition = this.player.getPosition();
        this.label.setText(`Player: ${game.session.playerName}`);
        this.backButton.setOnClick(() => {
            game.changeScene(new InitialScene());
        });
        this.backButton.update(input);
        this.player.update(dt, input, game);
        if (Collision.checkCollision(this.player, this.door)) {
            console.log("Colisão detectada");
            if (this.door.getIsTrigger()) {
                game.changeScene(new InitialScene());
                return;
            }

            this.player.setPosition(playerPreviousPosition.x, playerPreviousPosition.y);
        }

        if(input.mouseHovering(this.door)) {
            this.door.setColor("gray");
        } else {
            this.door.setColor(this.doorColor);
        }

        if(input.isMousePressed(MouseButton.LEFT)) {
            console.log("Mouse pressionado");
            const mousePosition = input.getMousePosition();
            console.log("Mouse position: ", mousePosition);
        }
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // trecho de código especifico para posicionar o player na tela, apenas uma vez na cena
        if (!this.placed) {
            this.x = width / 2;
            this.y = height / 2;
            this.player.setPosition(this.x, this.y);
            this.door.setPosition(this.x + 100, this.y + 100);
            this.placed = true;
        }

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
        this.backButton.render(ctx);
        this.label.render(ctx);
        this.player.render(ctx);
        this.door.render(ctx);
    }
}
