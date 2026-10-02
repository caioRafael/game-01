import type { InputService } from "@engine/inputs/input.service";

export interface GameContext{
    changeScene (scene: Scene): void;
}

export abstract class Scene {
    abstract update(
        dt: number,
        input: InputService,
        game: GameContext
    ): void;
    abstract render(
        ctx: CanvasRenderingContext2D,
        width: number, 
        height: number
    ): void;
}