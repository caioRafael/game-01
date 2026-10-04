import { SceneId } from "@core/persisted-game";
import type { Scene } from "@entities/scene";
import { FirstFaseScene } from "./first-fase.scene";
import { InitialScene } from "./initial.scene";

const factories = new Map<string, () => Scene>([
    [SceneId.Initial, () => new InitialScene()],
    [SceneId.FirstFase, () => new FirstFaseScene()],
]);

export function createScene(id: string): Scene {
    const factory = factories.get(id);
    if (!factory) return new InitialScene();
    return factory();
}
