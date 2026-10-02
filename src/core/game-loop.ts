import type { GameContext, Scene } from "../entities/scene";
import type { InputService } from "../engine/inputs/input.service";
import type { RendererService } from "../engine/renderer/renderer.service";

export function GameLoop(renderer: RendererService, getScene: () => Scene, input: InputService, game: GameContext){
    let last = performance.now();
    const loop = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        getScene().update(dt, input, game);
        renderer.render();
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}