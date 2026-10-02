import type { InputService } from "@engine/inputs/input.service";
import { Scene, type GameContext } from "@entities/scene";
import { Player } from "@entities/player";
import { GameObject } from "@entities/game-object";
import { Collision } from "@engine/physics/collision";
import { InitialScene } from "./initial.scene";

export class FirstFaseScene extends Scene {
    private x = 0;
    private y = 0;
    private placed = false;

    private player: Player = new Player(this.x, this.y, 100, 100); 
    private door: GameObject = new GameObject(this.x, this.y, 100, 100, "blue", false);

    update(dt: number, input: InputService, game: GameContext): void {
        const playerPreviousPosition = this.player.getPosition();
        this.player.update(dt, input, game);
        if (Collision.checkCollision(this.player, this.door)) {
            console.log("Colisão detectada");
            if (this.door.getIsTrigger()) {
                game.changeScene(new InitialScene());
                return;
            }

            this.player.setPosition(playerPreviousPosition.x, playerPreviousPosition.y);
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

        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, width, height);
        this.player.render(ctx);
        this.door.render(ctx);
    }
}
