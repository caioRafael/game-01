import type { InputService } from "@engine/inputs/input.service";

export interface GameSession {
    playerName: string;
}

export interface GameContext{
    changeScene (scene: Scene): void;
    session: GameSession;
}

export abstract class Scene {
    layout(_width: number, _height: number): void {}

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