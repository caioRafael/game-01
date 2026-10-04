import { TileMap } from "@engine/tilemap/tilemap";
import { TileId } from "@engine/tilemap/tile";

export const firstFaseTileSize = 64;

export const firstFaseSpawn = { column: 2, row: 2 };

const floor = TileId.Floor;
const wall = TileId.Wall;
const door = TileId.Door;

const tileByMark: Record<string, TileId> = {
    ".": floor,
    W: wall,
    D: door,
};

const layout = [
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "W..............................................W",
    "W..............................................W",
    "W..............................................W",
    "W..............................................W",
    "W.....WWWWWWWWWWWWWWWWWWWWWW...................W",
    "W..............................................W",
    "W..............................................W",
    "W...........WW..................WW.............W",
    "W...........WW..................WW.............W",
    "W...........WW..................WW.............W",
    "W...........WW..................WW.............W",
    "W...........WW..................WW.............W",
    "W..............................................W",
    "W..............................................W",
    "W..............................................W",
    "W.................WWWWWWWWWWWWWWWWWWWWWW.......W",
    "W..............................................W",
    "W..............................................W",
    "W..............................................W",
    "W...WWWWWWWWWWWWWW........WWWWWWWWWWWWWWWW.....W",
    "W..............................................W",
    "W.......................WW.....................W",
    "W.......................WW.....................W",
    "W.......................WW.....................W",
    "W.......................WW.....................W",
    "W..............................................W",
    "WWWWWWWWWWWWWWWWWWWWWWWWDWWWWWWWWWWWWWWWWWWWWWWW",
];

const rows = layout.map((line) => [...line].map((mark) => {
    const tile = tileByMark[mark];
    if (tile === undefined) throw new Error(`Marca de tile desconhecida: ${mark}`);
    return tile;
}));

export const firstFaseMap = new TileMap(rows[0]!.length, rows.length, firstFaseTileSize, rows);
