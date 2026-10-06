import { ImageSheet } from "@engine/sprite/image-sheet";
import type { TileCatalog, TileDefinition } from "@engine/tilemap/tile";

export const nordesteTileSize = 64;

export const groundSheet = new ImageSheet("/images/tiles/nordeste.png");
export const houseSheet = new ImageSheet("/images/tiles/casas.png");
export const plantSheet = new ImageSheet("/images/tiles/plantas.png");

export const GroundId = {
    Dirt: 1,
    Pebbles: 2,
    Sand: 3,
    Hay: 4,
    Gravel: 5,
    Path: 6,
    Yard: 7,
    Shade: 8,
    Mud: 9,
    Puddle: 10,
    LowGrass: 11,
    Sprouts: 12,
    TallGrass: 13,
    Flowers: 14,
    Footprints: 15,
    GrassRock: 16,
    Bricks: 17,
    Largo: 18,
    Lajota: 19,
    Asphalt: 20,
    Portuguese: 21,
    Hydraulic: 22,
    Curb: 23,
    Worn: 24,
    Water: 25,
    ShoreSouth: 26,
    ShoreNorth: 27,
    ShoreWest: 28,
    ShoreEast: 29,
} as const;

export type GroundId = (typeof GroundId)[keyof typeof GroundId];

function groundTile(id: GroundId, color: string, column: number, row: number, solid = false): TileDefinition {
    return {
        id,
        color,
        solid,
        trigger: false,
        sprite: { column, row },
    };
}

export const groundCatalog: TileCatalog = {
    [GroundId.Dirt]: groundTile(GroundId.Dirt, "#d6964e", 0, 0),
    [GroundId.Pebbles]: groundTile(GroundId.Pebbles, "#b98962", 1, 0),
    [GroundId.Sand]: groundTile(GroundId.Sand, "#e6c878", 2, 0),
    [GroundId.Hay]: groundTile(GroundId.Hay, "#c4a440", 3, 0),
    [GroundId.Gravel]: groundTile(GroundId.Gravel, "#a89880", 4, 0),
    [GroundId.Path]: groundTile(GroundId.Path, "#c48a4a", 5, 0),
    [GroundId.Yard]: groundTile(GroundId.Yard, "#c9a06a", 6, 0),
    [GroundId.Shade]: groundTile(GroundId.Shade, "#8a6848", 7, 0),
    [GroundId.Mud]: groundTile(GroundId.Mud, "#8d5a32", 0, 1),
    [GroundId.Puddle]: groundTile(GroundId.Puddle, "#6a8c58", 1, 1),
    [GroundId.LowGrass]: groundTile(GroundId.LowGrass, "#8aaa48", 2, 1),
    [GroundId.Sprouts]: groundTile(GroundId.Sprouts, "#7ea044", 3, 1),
    [GroundId.TallGrass]: groundTile(GroundId.TallGrass, "#5e9228", 4, 1),
    [GroundId.Flowers]: groundTile(GroundId.Flowers, "#d2b84a", 5, 1),
    [GroundId.Footprints]: groundTile(GroundId.Footprints, "#c08848", 6, 1),
    [GroundId.GrassRock]: groundTile(GroundId.GrassRock, "#7a9840", 7, 1),
    [GroundId.Bricks]: groundTile(GroundId.Bricks, "#8a8e96", 0, 2),
    [GroundId.Largo]: groundTile(GroundId.Largo, "#d8d0c0", 1, 2),
    [GroundId.Lajota]: groundTile(GroundId.Lajota, "#c8c2b4", 2, 2),
    [GroundId.Asphalt]: groundTile(GroundId.Asphalt, "#4a4e56", 3, 2),
    [GroundId.Portuguese]: groundTile(GroundId.Portuguese, "#d8d4cc", 4, 2),
    [GroundId.Hydraulic]: groundTile(GroundId.Hydraulic, "#d2c2a4", 5, 2),
    [GroundId.Curb]: groundTile(GroundId.Curb, "#b0aa9c", 6, 2),
    [GroundId.Worn]: groundTile(GroundId.Worn, "#b4a48c", 7, 2),
    [GroundId.Water]: groundTile(GroundId.Water, "#3a7ec8", 0, 3, true),
    [GroundId.ShoreSouth]: groundTile(GroundId.ShoreSouth, "#d6964e", 1, 3),
    [GroundId.ShoreNorth]: groundTile(GroundId.ShoreNorth, "#d6964e", 2, 3),
    [GroundId.ShoreWest]: groundTile(GroundId.ShoreWest, "#d6964e", 3, 3),
    [GroundId.ShoreEast]: groundTile(GroundId.ShoreEast, "#d6964e", 4, 3),
};

const kitOrder = [
    ["clayL", "clay", "clayR", "strawL", "straw", "strawR", "pinkTopL", "pinkTop"],
    ["eaveL", "eave", "eaveR", "strawEL", "strawE", "strawER", "pinkTopR", "yelTopL"],
    ["yelTop", "yelTopR", "wallL", "wall", "wallR", "adobeL", "adobe", "adobeR"],
    ["pinkL", "pink", "pinkR", "yelL", "yel", "yelR", "azulejo", "cobogo"],
    ["win", "winA", "winP", "winY", "muxarabi", "balcony", "doorTW", "doorTP"],
    ["doorTY", "doorTA", "doorBW", "doorBP", "doorBY", "doorBA", "baseL", "base"],
    ["baseR", "baseAL", "baseA", "baseAR", "basePL", "baseP", "basePR", "baseYL"],
    ["baseY", "baseYR", "muroL", "muro", "muroR", "cerca", "clay", "wall"],
];

export function kitCell(name: string): { column: number; row: number } {
    for (let row = 0; row < kitOrder.length; row++) {
        const column = kitOrder[row]?.indexOf(name) ?? -1;
        if (column >= 0) return { column, row };
    }
    throw new Error(`Peça de casa desconhecida: ${name}`);
}

export type HousePlan = {
    name: string;
    greeting: string;
    rows: readonly (readonly string[])[];
    doorColumn: number;
    doorRow: number;
};

export const colonialPlan: HousePlan = {
    name: "Casa colonial",
    greeting: "Você abre a porta azul da casa colonial.",
    rows: [
        ["clayL", "clay", "clay", "clay", "clayR"],
        ["eaveL", "eave", "eave", "eave", "eaveR"],
        ["wallL", "win", "doorTW", "muxarabi", "wallR"],
        ["baseL", "base", "doorBW", "base", "baseR"],
    ],
    doorColumn: 2,
    doorRow: 2,
};

export const rosaPlan: HousePlan = {
    name: "Casa rosa",
    greeting: "Você abre a porta da casa rosa.",
    rows: [
        ["pinkTopL", "pinkTop", "pinkTop", "pinkTopR"],
        ["pinkL", "winP", "doorTP", "pinkR"],
        ["basePL", "baseP", "doorBP", "basePR"],
    ],
    doorColumn: 2,
    doorRow: 1,
};

export const sertaoPlan: HousePlan = {
    name: "Casa de taipa",
    greeting: "Você abre a porta de madeira da casa de taipa.",
    rows: [
        ["strawL", "straw", "straw", "strawR"],
        ["strawEL", "strawE", "strawE", "strawER"],
        ["adobeL", "winA", "doorTA", "adobeR"],
        ["baseAL", "baseA", "doorBA", "baseAR"],
    ],
    doorColumn: 2,
    doorRow: 2,
};

export const predioPlan: HousePlan = {
    name: "Prédio",
    greeting: "Você abre a porta do prédio.",
    rows: [
        ["clayL", "clay", "clay", "clayR"],
        ["eaveL", "eave", "eave", "eaveR"],
        ["wallL", "win", "win", "wallR"],
        ["wallL", "balcony", "azulejo", "wallR"],
        ["wallL", "win", "doorTW", "wallR"],
        ["baseL", "base", "doorBW", "baseR"],
    ],
    doorColumn: 2,
    doorRow: 4,
};

export const amarelaPlan: HousePlan = {
    name: "Casa amarela",
    greeting: "Você abre a porta verde da casa amarela.",
    rows: [
        ["yelTopL", "yelTop", "yelTop", "yelTop", "yelTopR"],
        ["yelL", "cobogo", "winY", "doorTY", "yelR"],
        ["baseYL", "baseY", "baseY", "doorBY", "baseYR"],
    ],
    doorColumn: 3,
    doorRow: 1,
};

export const PlantKind = {
    Mandacaru: "mandacaru",
    MandacaruFlor: "mandacaru-flor",
    Xique: "xique",
    Facheiro: "facheiro",
    Macambira: "macambira",
    Catingueira: "catingueira",
    UmbuSeco: "umbu-seco",
    Juazeiro: "juazeiro",
    Carnauba: "carnauba",
    Coqueiro: "coqueiro",
    UmbuVerde: "umbu-verde",
    Mangueira: "mangueira",
} as const;

export type PlantKind = (typeof PlantKind)[keyof typeof PlantKind];

export const plantSpecs: Record<PlantKind, { column: number; row: number; columns: number; rows: number }> = {
    [PlantKind.Mandacaru]: { column: 0, row: 0, columns: 2, rows: 3 },
    [PlantKind.MandacaruFlor]: { column: 2, row: 0, columns: 2, rows: 3 },
    [PlantKind.Xique]: { column: 4, row: 0, columns: 2, rows: 2 },
    [PlantKind.Facheiro]: { column: 6, row: 0, columns: 2, rows: 3 },
    [PlantKind.Macambira]: { column: 8, row: 1, columns: 2, rows: 2 },
    [PlantKind.Catingueira]: { column: 0, row: 3, columns: 3, rows: 3 },
    [PlantKind.UmbuSeco]: { column: 3, row: 3, columns: 3, rows: 3 },
    [PlantKind.Juazeiro]: { column: 6, row: 3, columns: 3, rows: 3 },
    [PlantKind.Carnauba]: { column: 0, row: 6, columns: 2, rows: 4 },
    [PlantKind.Coqueiro]: { column: 2, row: 6, columns: 2, rows: 4 },
    [PlantKind.UmbuVerde]: { column: 4, row: 6, columns: 3, rows: 3 },
    [PlantKind.Mangueira]: { column: 7, row: 6, columns: 3, rows: 3 },
};
