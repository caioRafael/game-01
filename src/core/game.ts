import type { GameContext, Scene } from "@entities/scene";
import { InputService } from "@engine/inputs/input.service";
import { RendererService } from "@engine/renderer/renderer.service";
import { InitialScene } from "@scenes/initial.scene";
import { GameLoop } from "./game-loop";
import { CameraService } from "@engine/camera/camera.service";

export class Game{
    constructor(private canvas: HTMLCanvasElement){
        this.canvas = canvas;
    }

    start(){
        const renderer = new RendererService(this.canvas);
        const input = new InputService(this.canvas);
        let scene: Scene = new InitialScene();
        renderer.setCurrentScene(scene);
        const camera = new CameraService();

        const game: GameContext = {
            camera,
            session: {
                playerName: "",
            },
            changeScene(next) {
                if (scene.constructor === next.constructor) return;
                camera.reset();
                scene = next;
                renderer.setCurrentScene(next);
            },
        };

        GameLoop(renderer, () => scene, input, game);
    }
}
