export const SceneId = {
    Initial: "initial",
    InitialMap: "initial-map",
    FirstFase: "first-fase",
} as const;

export type SceneId = (typeof SceneId)[keyof typeof SceneId];

export interface PersistedGame {
    sceneId: SceneId;
    playerName: string;
}

export const defaultPersistedGame: PersistedGame = {
    sceneId: SceneId.Initial,
    playerName: "",
};

const maxPlayerNameLength = 64;

export function isSceneId(value: unknown): value is SceneId {
    return typeof value === "string" && (Object.values(SceneId) as string[]).includes(value);
}

export function parsePersistedGame(value: unknown): PersistedGame | null {
    if (typeof value !== "object" || value === null) return null;
    const record = value as Record<string, unknown>;
    const sceneId = record["sceneId"];
    const playerName = record["playerName"];
    if (!isSceneId(sceneId)) return null;
    if (typeof playerName !== "string" || playerName.length > maxPlayerNameLength) return null;
    return { sceneId, playerName };
}
