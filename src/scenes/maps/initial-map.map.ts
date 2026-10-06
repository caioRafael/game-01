import { TileMap } from "@engine/tilemap/tilemap";
import {
    GroundId,
    PlantKind,
    amarelaPlan,
    colonialPlan,
    groundCatalog,
    groundSheet,
    nordesteTileSize,
    predioPlan,
    rosaPlan,
    sertaoPlan,
    type HousePlan,
    type PlantKind as PlantName,
} from "./nordeste-art";

const tileByMark: Record<string, GroundId> = {
    c: GroundId.TallGrass, // capim fechado
    ".": GroundId.Dirt, // terra
    y: GroundId.Hay, // capim seco
    o: GroundId.Pebbles, // pedra
    a: GroundId.Sand, // areia
    v: GroundId.Gravel, // cascalho
    "-": GroundId.Path, // trilha
    q: GroundId.Yard, // quintal
    s: GroundId.Shade, // sombra
    m: GroundId.Mud, // barro
    w: GroundId.Puddle, // poça
    r: GroundId.LowGrass, // capim ralo
    b: GroundId.Sprouts, // brotos
    f: GroundId.Flowers, // flores
    e: GroundId.Footprints, // pegadas
    k: GroundId.GrassRock, // capim com pedra
    "#": GroundId.Bricks, // paralelepípedo
    L: GroundId.Largo, // largo
    "=": GroundId.Lajota, // lajota
    A: GroundId.Asphalt, // asfalto
    T: GroundId.Portuguese, // pedra portuguesa
    h: GroundId.Hydraulic, // ladrilho
    _: GroundId.Curb, // meio-fio
    g: GroundId.Worn, // calçada gasta
    "~": GroundId.Water, // água
    S: GroundId.ShoreSouth, // margem sul, terra em cima
    N: GroundId.ShoreNorth, // margem norte, água em cima
    "<": GroundId.ShoreWest, // margem oeste, água à esquerda
    ">": GroundId.ShoreEast, // margem leste, água à direita
};

const layout = [
    "cccccccccccccccccccccccccccccccccccccccccccccccc",
    "cccccccccccccccccccccccccccccccccccccccccccccccc",
    "......................................cSSSSSSScc",
    "..yyyyyyyyyy............vvvvvvvv......<~~~~~~~>c",
    "..yyyyyyyyyy..oooooooo..vvvvvvvv......<~~~~~~~>c",
    "..yyyyyyyyyy..oooooook..vvvvvvvv......<~~~~~~~>c",
    "..yykyyyyyyy..oooooooo................<~~~~~~~>c",
    "..................bbbbb...............<~~~~~~~>c",
    "........rrrrrr....bbbbb.....s......mmm<~~~~~~~>c",
    "........rrrrrr.....................mmmcNNNNNNNcc",
    "....................................--cccccccccc",
    "....................................--cccccccccc",
    "......qq....qq....qq....qq..........-ecccccccccc",
    "......qq....qq....qs....qq..........--cccccccccc",
    "......sq....qq....qq....qq..........e-cccccccccc",
    "......qq....qq....qq....qq..........--cccccccccc",
    "g====g====g====ge===g=e==g====g====g====cccccccc",
    "########################################AAAAAAAA",
    "########################################AAAAAAAA",
    "________________________________________cccccccc",
    "................................................",
    "..............................TTTTTTTTTTTT......",
    "rrrrrrrrrrrrrrrrrr............TfTTTTTTTTTf......",
    "rrrrrrrrrrrrrrrrrr............TTTLLLLTTThh......",
    "rrrrfrrrrrrrrrrrrr............TTTLLLLTTThh......",
    "rrrrrrrrrrrfrrrrrr............TTTLLLLTTTTT......",
    "rrrrrrrrrrrrrrrrrr............TTTTTTTTTTTT......",
    "rrrrrrrrrrrrrrrrrr............TTTTTTTTTTTT......",
    "..................yyyyyyyyyyyyTTTTTTaaaaaaaaaaaa",
    "..................yyyyyyyyyyyy......aaaaaaaaaaaa",
    "..cccccccccccccc..yyyyyyyyyyyy......aaaaoooaaaaa",
    "..cccccckccccccc..yyyyyyyyyyyy......aaaaoooaaaaa",
    "..cccccccccccccc....................aaaaaaaaaaaa",
    "....................................aaaaaaaaaaaa",
];

const rows = layout.map((line) => [...line].map((mark) => {
    const tile = tileByMark[mark];
    if (tile === undefined) throw new Error(`Marca de tile desconhecida: ${mark}`);
    return tile;
}));

const width = rows[0]?.length ?? 0;
if (width === 0 || rows.some((line) => line.length !== width)) {
    throw new Error("Linhas do mapa com tamanhos diferentes.");
}

export const initialMap = new TileMap(width, rows.length, nordesteTileSize, rows, groundCatalog, groundSheet);

export const initialMapSpawn = { column: 16, row: 17 };

export const initialMapHouses: { plan: HousePlan; column: number; row: number }[] = [
    { plan: colonialPlan, column: 1, row: 12 },
    { plan: rosaPlan, column: 8, row: 13 },
    { plan: sertaoPlan, column: 14, row: 12 },
    { plan: predioPlan, column: 20, row: 10 },
    { plan: amarelaPlan, column: 26, row: 13 },
];

export const initialMapTrees: { kind: PlantName; column: number; row: number }[] = [
    { kind: PlantKind.Mandacaru, column: 1, row: 2 },
    { kind: PlantKind.Facheiro, column: 6, row: 3 },
    { kind: PlantKind.Xique, column: 9, row: 6 },
    { kind: PlantKind.Macambira, column: 15, row: 7 },
    { kind: PlantKind.Catingueira, column: 20, row: 2 },
    { kind: PlantKind.UmbuSeco, column: 26, row: 3 },
    { kind: PlantKind.MandacaruFlor, column: 32, row: 4 },
    { kind: PlantKind.Carnauba, column: 34, row: 1 },
    { kind: PlantKind.Juazeiro, column: 33, row: 21 },
    { kind: PlantKind.UmbuVerde, column: 4, row: 23 },
    { kind: PlantKind.Mangueira, column: 12, row: 23 },
    { kind: PlantKind.Coqueiro, column: 42, row: 28 },
];
