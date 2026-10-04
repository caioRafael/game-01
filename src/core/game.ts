import type { GameContext, Scene } from "@entities/scene";
import { InputService } from "@engine/inputs/input.service";
import { RendererService } from "@engine/renderer/renderer.service";
import { createScene } from "@scenes/scene-catalog";
import { GameLoop } from "./game-loop";
import { CameraService } from "@engine/camera/camera.service";
import { loadPersistedGame, savePersistedGame } from "./game-state";

export class Game{
    constructor(private canvas: HTMLCanvasElement){
        this.canvas = canvas;
    }

    async start(){
        const saved = await loadPersistedGame();
        const renderer = new RendererService(this.canvas);
        const input = new InputService(this.canvas);
        let scene: Scene = createScene(saved.sceneId);
        renderer.setCurrentScene(scene);
        const camera = new CameraService();
        const session = {
            playerName: saved.playerName,
        };

        const game: GameContext = {
            camera,
            session,
            changeScene(next) {
                if (scene.constructor === next.constructor) return;
                camera.reset();
                scene = next;
                renderer.setCurrentScene(next);
                savePersistedGame({
                    sceneId: next.id,
                    playerName: session.playerName,
                });
            },
        };

        GameLoop(renderer, () => scene, input, game);
    }
}
