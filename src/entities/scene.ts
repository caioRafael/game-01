import type { SceneId } from "@core/persisted-game";
import type { InputService } from "@engine/inputs/input.service";
import type { CameraService } from "@engine/camera/camera.service";

export interface GameSession {
    playerName: string;
}

export interface GameContext{
    camera: CameraService;
    changeScene (scene: Scene): void;
    session: GameSession;
}

export abstract class Scene {
    abstract readonly id: SceneId;

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