import type { GameContext, Scene } from "../entities/scene";
import { InputService } from "../engine/inputs/input.service";
import { RendererService } from "../engine/renderer/renderer.service";
import { InitialScene } from "../scenes/initial.scene";
import { GameLoop } from "./game-loop";

export class Game{
    constructor(private canvas: HTMLCanvasElement){
        this.canvas = canvas;
    }

    start(){
        const renderer = new RendererService(this.canvas);
        const input = new InputService();
        let scene: Scene = new InitialScene();
        renderer.setCurrentScene(scene);

        const game: GameContext = {
            changeScene(next) {
                if (scene.constructor === next.constructor) return;
                scene = next;
                renderer.setCurrentScene(next);
            },
        };

        GameLoop(renderer, () => scene, input, game);
    }
}
