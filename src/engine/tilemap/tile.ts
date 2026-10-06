export const TileId = {
    Floor: 1,
    Wall: 2,
    Door: 3,
} as const;

export type TileId = (typeof TileId)[keyof typeof TileId];

export interface TileDefinition {
    id: number;
    color: string;
    solid: boolean;
    trigger: boolean;
    sprite?: { column: number; row: number };
}

export type TileCatalog = { readonly [id: number]: TileDefinition | undefined };

export const tileDefinitions: Record<TileId, TileDefinition> = {
    [TileId.Floor]: {
        id: TileId.Floor,
        color: "#2b2b2b",
        solid: false,
        trigger: false,
    },
    [TileId.Wall]: {
        id: TileId.Wall,
        color: "#6b4f2a",
        solid: true,
        trigger: false,
    },
    [TileId.Door]: {
        id: TileId.Door,
        color: "blue",
        solid: true,
        trigger: true,
    }
}