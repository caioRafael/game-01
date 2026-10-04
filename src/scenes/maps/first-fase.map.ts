import { TileMap } from "@engine/tilemap/tilemap";
import { TileId } from "@engine/tilemap/tile";

export const firstFaseTileSize = 64;

export const firstFaseSpawn = { column: 2, row: 2 };

const floor = TileId.Floor;
const wall = TileId.Wall;
const door = TileId.Door;

const rows = [
    [wall, wall, wall, wall, wall, wall, wall, wall],
    [wall, floor, floor, floor, floor, floor, floor, wall],
    [wall, floor, floor, floor, floor, floor, floor, wall],
    [wall, floor, floor, floor, floor, floor, floor, wall],
    [wall, wall, wall, door, wall, wall, wall, wall],
];

export const firstFaseMap = new TileMap(rows[0]!.length, rows.length, firstFaseTileSize, rows);