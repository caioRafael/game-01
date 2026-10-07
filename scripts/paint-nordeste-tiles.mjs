import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Chão, casas e plantas em folhas separadas.
// Cada célula lógica tem 16 px, no recorte do Stardew Valley, e sai ampliada 4× (64 px no mapa).
// Casas se montam juntando peças. Plantas ocupam vários tiles e o fundo delas é transparente.

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logical = 16;
const scale = 4;

const C = {
    ink: [78, 46, 32, 255],
    inkG: [36, 82, 28, 255],
    dirt: [214, 150, 78, 255],
    dirtL: [236, 186, 114, 255],
    dirtD: [168, 104, 52, 255],
    hay: [196, 164, 64, 255],
    hayL: [228, 200, 96, 255],
    mud: [156, 102, 60, 255],
    mudD: [112, 70, 42, 255],
    sand: [236, 204, 128, 255],
    sandD: [204, 164, 88, 255],
    grass: [96, 176, 62, 255],
    grassL: [168, 214, 86, 255],
    grassD: [52, 124, 40, 255],
    water: [64, 148, 206, 255],
    waterL: [156, 214, 236, 255],
    waterD: [36, 104, 168, 255],
    roof: [198, 78, 58, 255],
    roofL: [236, 132, 86, 255],
    roofD: [140, 48, 42, 255],
    wall: [246, 230, 198, 255],
    wallD: [204, 176, 140, 255],
    stain: [176, 132, 88, 255],
    stone: [176, 164, 148, 255],
    stoneL: [220, 210, 194, 255],
    stoneD: [112, 102, 90, 255],
    blue: [52, 116, 204, 255],
    blueL: [116, 176, 236, 255],
    blueD: [28, 68, 140, 255],
    wood: [176, 112, 60, 255],
    woodL: [214, 156, 92, 255],
    woodD: [112, 68, 36, 255],
    pink: [232, 104, 132, 255],
    pinkD: [176, 64, 92, 255],
    yel: [240, 184, 56, 255],
    yelL: [252, 220, 112, 255],
    yelD: [184, 124, 32, 255],
    green: [42, 140, 86, 255],
    greenL: [96, 186, 120, 255],
    greenD: [24, 88, 56, 255],
    cact: [62, 158, 72, 255],
    cactL: [140, 204, 104, 255],
    xiq: [132, 156, 112, 255],
    xiqL: [186, 196, 140, 255],
    xiqD: [72, 96, 64, 255],
    fach: [56, 156, 150, 255],
    fachL: [140, 204, 176, 255],
    fachD: [28, 96, 100, 255],
    leaf: [46, 150, 58, 255],
    leafL: [132, 196, 78, 255],
    leafD: [24, 96, 40, 255],
    mango: [28, 110, 48, 255],
    mangoL: [72, 156, 64, 255],
    pale: [228, 206, 164, 255],
    cream: [244, 232, 204, 255],
    conc: [186, 182, 174, 255],
    concL: [224, 220, 210, 255],
    concD: [124, 120, 114, 255],
    asph: [92, 100, 110, 255],
    asphL: [148, 156, 164, 255],
    asphD: [58, 64, 74, 255],
    straw: [214, 170, 72, 255],
    strawL: [236, 204, 112, 255],
    strawD: [156, 112, 48, 255],
    iron: [72, 80, 92, 255],
    ironL: [156, 164, 172, 255],
    gold: [228, 176, 64, 255],
    flower: [244, 120, 148, 255],
    glass: [186, 228, 220, 255],
    adobe: [186, 122, 72, 255],
    adobeD: [140, 84, 48, 255],
};

class Pix {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.d = new Uint8Array(w * h * 4);
    }

    px(x, y, c) {
        x = Math.round(x);
        y = Math.round(y);
        if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
        const i = (y * this.w + x) * 4;
        this.d[i] = c[0];
        this.d[i + 1] = c[1];
        this.d[i + 2] = c[2];
        this.d[i + 3] = c[3] ?? 255;
    }

    get(x, y) {
        const i = (y * this.w + x) * 4;
        return [this.d[i], this.d[i + 1], this.d[i + 2], this.d[i + 3]];
    }

    fill(x, y, w, h, c) {
        for (let yy = y; yy < y + h; yy++) {
            for (let xx = x; xx < x + w; xx++) this.px(xx, yy, c);
        }
    }

    hline(x, y, w, c) {
        for (let i = 0; i < w; i++) this.px(x + i, y, c);
    }

    vline(x, y, h, c) {
        for (let i = 0; i < h; i++) this.px(x, y + i, c);
    }

    line(x0, y0, x1, y1, c) {
        const steps = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            this.px(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, c);
        }
    }

    disc(x, y, rx, ry, c) {
        for (let yy = -ry; yy <= ry; yy++) {
            const span = ry === 0 ? rx : rx * Math.sqrt(Math.max(0, 1 - (yy * yy) / (ry * ry)));
            for (let xx = -Math.round(span); xx <= Math.round(span); xx++) this.px(x + xx, y + yy, c);
        }
    }
}

function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
}

function chunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const name = Buffer.from(type);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
    return Buffer.concat([length, name, data, crc]);
}

function encode(width, height, rgba) {
    const raw = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y++) {
        const start = y * (width * 4 + 1);
        raw[start] = 0;
        for (let x = 0; x < width * 4; x++) raw[start + 1 + x] = rgba[y * width * 4 + x];
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk("IHDR", ihdr),
        chunk("IDAT", deflateSync(raw)),
        chunk("IEND", Buffer.alloc(0)),
    ]);
}

function scalePix(src, factor) {
    const out = new Pix(src.w * factor, src.h * factor);
    for (let y = 0; y < src.h; y++) {
        for (let x = 0; x < src.w; x++) {
            const color = src.get(x, y);
            for (let sy = 0; sy < factor; sy++) {
                for (let sx = 0; sx < factor; sx++) out.px(x * factor + sx, y * factor + sy, color);
            }
        }
    }
    return out;
}

function save(name, pix) {
    writeFileSync(resolve(root, "src/images/tiles", name), encode(pix.w, pix.h, pix.d));
}

function tuft(p, x, y, light, dark) {
    p.px(x, y - 1, light);
    p.px(x, y, light);
    p.px(x + 1, y, dark);
}

function dirt(p) {
    p.fill(0, 0, 16, 16, C.dirt);
    for (const [x, y] of [[3, 4], [11, 3], [8, 10], [13, 7], [5, 13]]) p.px(x, y, C.dirtD);
    for (const [x, y] of [[6, 7], [12, 12]]) p.px(x, y, C.dirtL);
}

function sand(p) {
    p.fill(0, 0, 16, 16, C.sand);
    for (const [x, y] of [[4, 5], [11, 8], [7, 12]]) p.px(x, y, C.sandD);
}

function mud(p) {
    p.fill(0, 0, 16, 16, C.mud);
    for (const [x, y] of [[2, 6], [9, 4], [13, 11], [6, 13]]) p.px(x, y, C.mudD);
}

function hay(p) {
    dirt(p);
    for (const [x, y] of [[2, 5], [8, 3], [12, 8], [5, 11], [10, 14]]) tuft(p, x, y, C.hayL, C.hay);
}

function pebbles(p) {
    dirt(p);
    p.fill(4, 6, 2, 2, C.stone);
    p.px(4, 6, C.stoneL);
    p.fill(10, 11, 2, 2, C.stoneD);
}

function gravel(p) {
    dirt(p);
    for (const [x, y] of [[2, 3], [7, 2], [12, 4], [4, 8], [9, 7], [14, 9], [3, 12], [8, 13]]) p.px(x, y, C.stone);
}

function path(p) {
    dirt(p);
    p.fill(6, 0, 4, 16, C.dirtD);
    p.vline(6, 0, 16, C.dirtL);
}

function yard(p) {
    dirt(p);
    p.hline(3, 6, 4, C.strawD);
    p.hline(9, 10, 5, C.straw);
}

function shade(p) {
    dirt(p);
    p.disc(8, 8, 4, 3, C.dirtD);
}

function puddle(p) {
    mud(p);
    p.disc(8, 9, 4, 2, C.waterD);
    p.disc(8, 8, 3, 2, C.water);
    p.px(6, 8, C.waterL);
}

function lowGrass(p) {
    mud(p);
    for (const [x, y] of [[3, 4], [8, 7], [13, 5], [6, 12], [11, 14]]) tuft(p, x, y, C.grassL, C.grass);
}

function sprouts(p) {
    mud(p);
    for (const [x, y] of [[4, 5], [9, 8], [13, 12], [6, 14]]) p.px(x, y, C.grassL);
}

function flower(p, x, y, petal, center) {
    p.px(x, y - 1, petal);
    p.px(x - 1, y, petal);
    p.px(x + 1, y, petal);
    p.px(x, y, center);
    p.px(x, y + 1, C.grassD);
}

function tallGrass(p) {
    p.fill(0, 0, 16, 16, C.grass);
    for (const [x, y] of [[2, 3], [6, 6], [11, 4], [4, 10], [9, 12], [13, 9], [7, 15]]) tuft(p, x, y, C.grassL, C.grassD);
}

function flowers(p) {
    tallGrass(p);
    flower(p, 12, 7, C.yel, C.yelD);
    flower(p, 4, 5, C.flower, C.yel);
}

function footprints(p) {
    mud(p);
    p.disc(6, 5, 1, 1, C.mudD);
    p.disc(9, 8, 1, 1, C.mudD);
    p.disc(6, 11, 1, 1, C.mudD);
}

function grassRock(p) {
    lowGrass(p);
    p.fill(10, 9, 3, 2, C.stone);
    p.px(10, 9, C.stoneL);
}

function bricks(p) {
    for (let y = 0; y < 16; y++) {
        const row = Math.floor(y / 4);
        const offset = (row % 2) * 4;
        for (let x = 0; x < 16; x++) {
            const lx = (x + offset) % 8;
            const ly = y % 4;
            if (lx === 0 || ly === 0) p.px(x, y, C.stoneD);
            else if (lx === 1 || ly === 1) p.px(x, y, C.stoneL);
            else p.px(x, y, C.stone);
        }
    }
}

function largo(p) {
    p.fill(0, 0, 16, 16, C.stoneD);
    for (const [x, y] of [[4, 4], [12, 4], [4, 12], [12, 12]]) {
        p.disc(x, y, 3, 2, C.stone);
        p.px(x - 1, y - 1, C.stoneL);
    }
}

function lajotaAt(x, y) {
    if (x % 8 === 0 || y % 8 === 0) return C.concD;
    if (x % 8 === 1 || y % 8 === 1) return C.concL;
    return C.conc;
}

function lajota(p) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p.px(x, y, lajotaAt(x, y));
}

function asphaltAt(x, y) {
    return (x + y) % 9 === 0 ? C.asphL : C.asph;
}

function asphalt(p) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p.px(x, y, asphaltAt(x, y));
    p.px(10, 4, C.asphD);
    p.px(11, 5, C.asphD);
    p.px(12, 6, C.sandD);
}

function portuguese(p) {
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const wave = Math.round(Math.sin((x / 16) * Math.PI * 2) * 2);
            const band = Math.floor((y + wave + 16) / 4) % 2;
            p.px(x, y, band ? C.cream : C.asphD);
        }
    }
}

function hydraulic(p) {
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const diamond = Math.abs((x % 8) - 3) + Math.abs((y % 8) - 3);
            p.px(x, y, diamond <= 2 ? C.blue : diamond === 3 ? C.blueL : C.wall);
        }
    }
}

function curb(p) {
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            if (y < 7) p.px(x, y, asphaltAt(x, y));
            else if (y < 9) p.px(x, y, y === 7 ? C.concL : C.concD);
            else p.px(x, y, lajotaAt(x, y));
        }
    }
}

function worn(p) {
    lajota(p);
    p.disc(5, 10, 2, 2, C.sand);
}

function waterAt(x, y) {
    const row = Math.floor((((y % 16) + 16) % 16) / 4);
    const onDash = ((y % 16) + 16) % 4 === 1 && (x + row * 3) % 8 < 4;
    if (onDash) return C.waterL;
    return row % 2 === 0 ? C.water : C.waterD;
}

function water(p) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p.px(x, y, waterAt(x, y));
}

function shore(p, side) {
    dirt(p);
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const wobble = (side === "s" || side === "n" ? x : y) % 5 === 0 ? 1 : 0;
            const line = 8 + wobble;
            const wet = side === "s" ? y > line : side === "n" ? y < line : side === "w" ? x < line : x > line;
            if (wet) p.px(x, y, waterAt(x, y));
        }
    }
}

const groundOrder = [
    [dirt, pebbles, sand, hay, gravel, path, yard, shade],
    [mud, puddle, lowGrass, sprouts, tallGrass, flowers, footprints, grassRock],
    [bricks, largo, lajota, asphalt, portuguese, hydraulic, curb, worn],
    [water, (p) => shore(p, "s"), (p) => shore(p, "n"), (p) => shore(p, "w"), (p) => shore(p, "e"), sand, path, tallGrass],
];

function paintGrid(order) {
    const sheet = new Pix(order[0].length * logical, order.length * logical);
    order.forEach((row, ty) => {
        row.forEach((paint, tx) => {
            const tile = new Pix(logical, logical);
            paint(tile);
            for (let y = 0; y < logical; y++) {
                for (let x = 0; x < logical; x++) sheet.px(tx * logical + x, ty * logical + y, tile.get(x, y));
            }
        });
    });
    return sheet;
}

function shingle(x, y, body, light, dark) {
    const row = Math.floor(y / 4);
    const ly = ((y % 4) + 4) % 4;
    const lx = (x + (row % 2) * 2) % 4;
    if (ly === 0) return light;
    if (ly === 3 || lx === 0) return dark;
    if (lx === 1) return light;
    return body;
}

function paintRoof(p, kind, edge, part) {
    const body = kind === "straw" ? C.straw : C.roof;
    const light = kind === "straw" ? C.strawL : C.roofL;
    const dark = kind === "straw" ? C.strawD : C.roofD;
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const eave = part === "eave" && y >= 12;
            p.px(x, y, eave ? (y === 15 ? C.ink : dark) : shingle(x, y, body, light, dark));
        }
    }
    if (part === "top") p.hline(0, 0, 16, C.ink);
    if (edge === "l") p.vline(0, 0, 16, C.ink);
    if (edge === "r") p.vline(15, 0, 16, C.ink);
}

function edgeInk(p, edge) {
    if (edge === "l") p.vline(0, 0, 16, C.ink);
    if (edge === "r") p.vline(15, 0, 16, C.ink);
}

function paintWall(p, color, edge) {
    p.fill(0, 0, 16, 16, color);
    edgeInk(p, edge);
}

function paintAdobe(p, edge) {
    for (let y = 0; y < 16; y++) {
        const row = Math.floor(y / 4);
        const offset = (row % 2) * 4;
        for (let x = 0; x < 16; x++) {
            const seam = y % 4 === 0 || (x + offset) % 8 === 0;
            p.px(x, y, seam ? C.adobeD : C.adobe);
        }
    }
    edgeInk(p, edge);
}

function paintBase(p, color, edge, adobe = false) {
    if (adobe) paintAdobe(p, edge);
    else paintWall(p, color, edge);
    p.fill(0, 13, 16, 2, C.stoneD);
    p.hline(0, 15, 16, C.ink);
    edgeInk(p, edge);
}

function paintWindow(p, color, adobe = false) {
    if (adobe) paintAdobe(p, "c");
    else p.fill(0, 0, 16, 16, color);
    p.fill(3, 3, 10, 10, C.woodD);
    p.fill(4, 4, 8, 8, C.glass);
    p.vline(8, 4, 8, C.wood);
    p.hline(4, 8, 8, C.wood);
    p.px(5, 5, C.cream);
}

function paintMuxarabi(p) {
    p.fill(0, 0, 16, 16, C.wall);
    p.fill(2, 3, 12, 10, C.woodD);
    for (let x = 2; x < 14; x += 2) p.vline(x, 3, 10, C.woodL);
    for (let y = 3; y < 13; y += 2) p.hline(2, y, 12, C.wood);
}

function paintAzulejo(p) {
    p.fill(0, 0, 16, 16, C.wall);
    for (let y = 2; y < 10; y++) {
        for (let x = 2; x < 14; x++) {
            const diamond = Math.abs((x % 4) - 1) + Math.abs((y % 4) - 1);
            p.px(x, y, diamond <= 1 ? C.blue : C.cream);
        }
    }
}

function paintCobogo(p) {
    p.fill(0, 0, 16, 16, C.yel);
    for (let y = 3; y < 13; y++) {
        for (let x = 3; x < 13; x++) p.px(x, y, x % 2 === 0 && y % 2 === 0 ? C.woodD : C.concL);
    }
}

function paintBalcony(p) {
    p.fill(0, 0, 16, 16, C.wall);
    p.fill(3, 2, 10, 8, C.blueD);
    p.fill(4, 3, 8, 6, C.glass);
    p.hline(2, 11, 12, C.woodD);
    p.hline(2, 13, 12, C.wood);
    for (let x = 3; x < 13; x += 2) p.vline(x, 11, 4, C.woodL);
}

function paintDoorLeaf(p, y, h, door, doorL, doorD) {
    p.fill(1, y, 14, h, doorD);
    p.fill(2, y, 12, h, door);
    p.vline(2, y, h, doorL);
    p.vline(8, y, h, doorD);
}

function paintDoor(p, wall, door, doorL, doorD, part, adobe = false) {
    if (adobe) paintAdobe(p, "c");
    else p.fill(0, 0, 16, 16, wall);
    if (part === "top") {
        p.fill(1, 0, 14, 3, C.woodD);
        p.hline(1, 3, 14, C.ink);
        paintDoorLeaf(p, 4, 12, door, doorL, doorD);
        p.hline(2, 9, 6, doorD);
        p.hline(9, 9, 6, doorD);
    } else {
        paintDoorLeaf(p, 0, 12, door, doorL, doorD);
        p.hline(2, 5, 6, doorD);
        p.hline(9, 5, 6, doorD);
        p.px(12, 6, C.gold);
        p.fill(1, 12, 14, 1, C.stoneL);
        p.fill(0, 13, 16, 2, C.stoneD);
        p.hline(0, 15, 16, C.ink);
    }
}

function paintPlatibanda(p, wall, trim, edge) {
    p.fill(0, 0, 16, 16, wall);
    p.fill(0, 1, 16, 4, trim);
    p.hline(0, 0, 16, C.ink);
    p.hline(0, 4, 16, trim);
    if (edge === "c") {
        p.px(8, 1, C.cream);
        p.px(7, 2, C.cream);
        p.px(9, 2, C.cream);
        p.px(8, 3, C.cream);
    }
    if (edge === "l") {
        p.vline(0, 0, 16, C.ink);
        p.px(3, 2, C.cream);
    }
    if (edge === "r") {
        p.vline(15, 0, 16, C.ink);
        p.px(12, 2, C.cream);
    }
}

function paintMuro(p, edge) {
    paintAdobe(p, edge);
    p.hline(0, 0, 16, C.dirtL);
    p.hline(0, 1, 16, C.adobeD);
    p.fill(0, 13, 16, 2, C.stoneD);
    p.hline(0, 15, 16, C.ink);
    edgeInk(p, edge);
}

function paintCerca(p) {
    p.hline(0, 6, 16, C.woodD);
    p.hline(0, 10, 16, C.woodL);
    p.vline(1, 2, 13, C.ink);
    p.vline(2, 2, 13, C.wood);
}

const kitPainters = {
    clayL: (p) => paintRoof(p, "clay", "l", "top"),
    clay: (p) => paintRoof(p, "clay", "c", "top"),
    clayR: (p) => paintRoof(p, "clay", "r", "top"),
    strawL: (p) => paintRoof(p, "straw", "l", "top"),
    straw: (p) => paintRoof(p, "straw", "c", "top"),
    strawR: (p) => paintRoof(p, "straw", "r", "top"),
    eaveL: (p) => paintRoof(p, "clay", "l", "eave"),
    eave: (p) => paintRoof(p, "clay", "c", "eave"),
    eaveR: (p) => paintRoof(p, "clay", "r", "eave"),
    strawEL: (p) => paintRoof(p, "straw", "l", "eave"),
    strawE: (p) => paintRoof(p, "straw", "c", "eave"),
    strawER: (p) => paintRoof(p, "straw", "r", "eave"),
    pinkTopL: (p) => paintPlatibanda(p, C.pink, C.yel, "l"),
    pinkTop: (p) => paintPlatibanda(p, C.pink, C.yel, "c"),
    pinkTopR: (p) => paintPlatibanda(p, C.pink, C.yel, "r"),
    yelTopL: (p) => paintPlatibanda(p, C.yel, C.green, "l"),
    yelTop: (p) => paintPlatibanda(p, C.yel, C.green, "c"),
    yelTopR: (p) => paintPlatibanda(p, C.yel, C.green, "r"),
    wallL: (p) => paintWall(p, C.wall, "l"),
    wall: (p) => paintWall(p, C.wall, "c"),
    wallR: (p) => paintWall(p, C.wall, "r"),
    adobeL: (p) => paintAdobe(p, "l"),
    adobe: (p) => paintAdobe(p, "c"),
    adobeR: (p) => paintAdobe(p, "r"),
    pinkL: (p) => paintWall(p, C.pink, "l"),
    pink: (p) => paintWall(p, C.pink, "c"),
    pinkR: (p) => paintWall(p, C.pink, "r"),
    yelL: (p) => paintWall(p, C.yel, "l"),
    yel: (p) => paintWall(p, C.yel, "c"),
    yelR: (p) => paintWall(p, C.yel, "r"),
    win: (p) => paintWindow(p, C.wall),
    winA: (p) => paintWindow(p, C.adobe, true),
    winP: (p) => paintWindow(p, C.pink),
    winY: (p) => paintWindow(p, C.yel),
    muxarabi: paintMuxarabi,
    balcony: paintBalcony,
    azulejo: paintAzulejo,
    cobogo: paintCobogo,
    doorTW: (p) => paintDoor(p, C.wall, C.blue, C.blueL, C.blueD, "top"),
    doorTP: (p) => paintDoor(p, C.pink, C.blue, C.blueL, C.blueD, "top"),
    doorTY: (p) => paintDoor(p, C.yel, C.green, C.greenL, C.greenD, "top"),
    doorTA: (p) => paintDoor(p, C.adobe, C.wood, C.woodL, C.woodD, "top", true),
    doorBW: (p) => paintDoor(p, C.wall, C.blue, C.blueL, C.blueD, "bot"),
    doorBP: (p) => paintDoor(p, C.pink, C.blue, C.blueL, C.blueD, "bot"),
    doorBY: (p) => paintDoor(p, C.yel, C.green, C.greenL, C.greenD, "bot"),
    doorBA: (p) => paintDoor(p, C.adobe, C.wood, C.woodL, C.woodD, "bot", true),
    baseL: (p) => paintBase(p, C.wall, "l"),
    base: (p) => paintBase(p, C.wall, "c"),
    baseR: (p) => paintBase(p, C.wall, "r"),
    baseAL: (p) => paintBase(p, C.adobe, "l", true),
    baseA: (p) => paintBase(p, C.adobe, "c", true),
    baseAR: (p) => paintBase(p, C.adobe, "r", true),
    basePL: (p) => paintBase(p, C.pink, "l"),
    baseP: (p) => paintBase(p, C.pink, "c"),
    basePR: (p) => paintBase(p, C.pink, "r"),
    baseYL: (p) => paintBase(p, C.yel, "l"),
    baseY: (p) => paintBase(p, C.yel, "c"),
    baseYR: (p) => paintBase(p, C.yel, "r"),
    muroL: (p) => paintMuro(p, "l"),
    muro: (p) => paintMuro(p, "c"),
    muroR: (p) => paintMuro(p, "r"),
    cerca: paintCerca,
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

function paintKit() {
    const order = kitOrder.map((row) => row.map((name) => kitPainters[name]));
    return paintGrid(order);
}

function compose(rows) {
    const width = rows[0].length;
    const height = rows.length;
    const sheet = new Pix(width * logical, height * logical);
    rows.forEach((row, ty) => {
        row.forEach((name, tx) => {
            const tile = new Pix(logical, logical);
            kitPainters[name](tile);
            for (let y = 0; y < logical; y++) {
                for (let x = 0; x < logical; x++) sheet.px(tx * logical + x, ty * logical + y, tile.get(x, y));
            }
        });
    });
    return sheet;
}

const houses = [
    {
        name: "colonial",
        rows: [
            ["clayL", "clay", "clay", "clay", "clayR"],
            ["eaveL", "eave", "eave", "eave", "eaveR"],
            ["wallL", "win", "doorTW", "muxarabi", "wallR"],
            ["baseL", "base", "doorBW", "base", "baseR"],
        ],
    },
    {
        name: "rosa",
        rows: [
            ["pinkTopL", "pinkTop", "pinkTop", "pinkTopR"],
            ["pinkL", "winP", "doorTP", "pinkR"],
            ["basePL", "baseP", "doorBP", "basePR"],
        ],
    },
    {
        name: "sertao",
        rows: [
            ["strawL", "straw", "straw", "strawR"],
            ["strawEL", "strawE", "strawE", "strawER"],
            ["adobeL", "winA", "doorTA", "adobeR"],
            ["baseAL", "baseA", "doorBA", "baseAR"],
        ],
    },
    {
        name: "predio",
        rows: [
            ["clayL", "clay", "clay", "clayR"],
            ["eaveL", "eave", "eave", "eaveR"],
            ["wallL", "win", "win", "wallR"],
            ["wallL", "balcony", "azulejo", "wallR"],
            ["wallL", "win", "doorTW", "wallR"],
            ["baseL", "base", "doorBW", "baseR"],
        ],
    },
    {
        name: "amarela",
        rows: [
            ["yelTopL", "yelTop", "yelTop", "yelTop", "yelTopR"],
            ["yelL", "cobogo", "winY", "doorTY", "yelR"],
            ["baseYL", "baseY", "baseY", "doorBY", "baseYR"],
        ],
    },
];

function paintHouses() {
    const built = houses.map((house) => compose(house.rows));
    const width = built.reduce((sum, pix) => sum + pix.w, 0);
    const height = Math.max(...built.map((pix) => pix.h));
    const sheet = new Pix(width, height);
    let x = 0;
    const rects = [];
    built.forEach((pix, index) => {
        const y = height - pix.h;
        for (let yy = 0; yy < pix.h; yy++) {
            for (let xx = 0; xx < pix.w; xx++) sheet.px(x + xx, y + yy, pix.get(xx, yy));
        }
        rects.push({
            name: houses[index].name,
            x: x * scale,
            y: y * scale,
            w: pix.w * scale,
            h: pix.h * scale,
            tilesX: houses[index].rows[0].length,
            tilesY: houses[index].rows.length,
        });
        x += pix.w;
    });
    return { sheet, rects };
}

function arm(p, x0, y0, x1, y1, r, fill, light, edge) {
    const steps = Math.max(4, Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        p.disc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r + 1, r + 1, edge);
    }
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        p.disc(x, y, r, r, fill);
        p.px(x - 1, y - 1, light);
    }
}

function spine(p, x, y) {
    p.px(x, y, C.cream);
}

function drawMandacaru(p, bloom) {
    const cx = 16;
    arm(p, cx, 44, cx, 8, 4, C.cact, C.cactL, C.inkG);
    arm(p, cx, 28, 6, 12, 3, C.cact, C.cactL, C.inkG);
    arm(p, cx, 24, 26, 10, 3, C.cact, C.cactL, C.inkG);
    for (const [x, y] of [[8, 16], [24, 14], [12, 22], [20, 18], [6, 12], [26, 10]]) spine(p, x, y);
    p.disc(cx, 44, 6, 2, C.dirtD);
    if (bloom) {
        flower(p, cx, 8, C.cream, C.yel);
        flower(p, 6, 12, C.cream, C.yel);
        flower(p, 26, 10, C.cream, C.yel);
    }
}

function drawXique(p) {
    const stems = [[8, 30, 5, 3], [13, 30, 12, 2], [18, 30, 22, 4], [24, 30, 28, 8], [16, 30, 18, 6]];
    for (const [x0, y0, x1, y1] of stems) arm(p, x0, y0, x1, y1, 3, C.xiq, C.xiqL, C.xiqD);
    p.disc(16, 30, 10, 2, C.dirtD);
}

function drawFacheiro(p) {
    arm(p, 16, 44, 16, 34, 3, C.fach, C.fachL, C.fachD);
    for (const [x, y] of [[6, 8], [12, 4], [20, 6], [26, 12]]) arm(p, 16, 36, x, y, 2, C.fach, C.fachL, C.fachD);
    p.disc(16, 44, 6, 2, C.dirtD);
}

function drawMacambira(p) {
    const cx = 16;
    const cy = 20;
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const x = cx + Math.cos(a) * 13;
        const y = cy + Math.sin(a) * 10;
        p.line(cx, cy, x, y, C.inkG);
        p.line(cx, cy, x, y, C.xiq);
        p.line(cx + 1, cy, x + 1, y, C.xiqL);
        p.px(x, y, i % 2 ? C.roof : C.hay);
    }
    p.disc(cx, cy, 4, 3, C.xiqD);
}

function limb(p, x0, y0, x1, y1, color) {
    p.line(x0, y0 + 1, x1, y1 + 1, C.ink);
    p.line(x0, y0, x1, y1, color);
    p.line(x0 - 1, y0, x1 - 1, y1, color);
}

function drawBare(p, wide, blossoms) {
    const cx = (p.w / 2) | 0;
    const foot = p.h - 2;
    p.disc(cx, foot, 10, 3, C.dirtD);
    const trunkTop = wide ? foot - 16 : foot - 20;
    p.fill(cx - 3, trunkTop, 7, foot - trunkTop, C.ink);
    p.fill(cx - 2, trunkTop, 5, foot - trunkTop - 1, C.wood);
    p.vline(cx - 2, trunkTop, 6, C.woodL);
    limb(p, cx, trunkTop, 4, 8, C.pale);
    limb(p, cx, trunkTop, p.w - 5, 6, C.pale);
    limb(p, cx, trunkTop + 4, 10, 16, C.woodL);
    limb(p, cx, trunkTop + 4, p.w - 10, 14, C.woodL);
    if (wide) limb(p, 8, 18, p.w - 8, 16, C.woodL);
    if (blossoms) {
        for (const [x, y] of [[4, 8], [p.w - 5, 6], [10, 16], [p.w - 10, 14], [cx, 10]]) {
            p.disc(x, y, 2, 2, C.yel);
            p.px(x, y, C.yelL);
        }
    }
}

function drawCanopy(p, fill, light, dark, fruit, flat = false) {
    const cx = (p.w / 2) | 0;
    const cy = Math.floor(p.h * (flat ? 0.46 : 0.36));
    const rx = Math.floor(p.w * (flat ? 0.48 : 0.44));
    const ry = Math.floor(p.h * (flat ? 0.2 : 0.3));
    p.disc(cx, p.h - 4, Math.floor(rx * 0.55), 3, C.dirtD);
    p.disc(cx, cy, rx + 2, ry + 2, dark);
    p.disc(cx - Math.floor(rx * 0.35), cy - 2, Math.floor(rx * 0.45), Math.floor(ry * 0.55), dark);
    p.disc(cx + Math.floor(rx * 0.3), cy + 2, Math.floor(rx * 0.4), Math.floor(ry * 0.5), dark);
    p.disc(cx, cy, rx, ry, fill);
    p.disc(cx - Math.floor(rx * 0.35), cy - 2, Math.floor(rx * 0.4), Math.floor(ry * 0.45), fill);
    p.disc(cx - Math.floor(rx * 0.45), cy - Math.floor(ry * 0.35), Math.floor(rx * 0.28), Math.floor(ry * 0.28), light);
    if (fruit) {
        p.disc(cx - 6, cy + 4, 2, 2, C.roof);
        p.px(cx + 7, cy - 2, C.yel);
    }
    const top = cy + ry - 4;
    p.fill(cx - 2, top, 6, p.h - top, C.ink);
    p.fill(cx - 1, top, 4, p.h - top - 1, C.wood);
    p.vline(cx - 1, top, 8, C.woodL);
}

function drawPalm(p, sand, fan) {
    const cx = (p.w / 2) | 0;
    const crown = Math.floor(p.h * 0.42);
    p.disc(cx, p.h - 3, 5, 2, sand ? C.sandD : C.dirtD);
    p.fill(cx - 2, crown, 5, p.h - crown, C.ink);
    p.fill(cx - 1, crown, 3, p.h - crown - 1, C.woodL);
    for (let y = crown + 4; y < p.h - 4; y += 4) p.hline(cx - 2, y, 5, C.woodD);
    const count = fan ? 9 : 7;
    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const a = Math.PI * (0.08 + t * 0.84);
        const len = fan ? 16 : 14;
        const x = cx + Math.cos(a) * (len + 4);
        const y = crown - Math.sin(a) * len + (fan ? 0 : (1 - Math.sin(a)) * 10);
        p.line(cx, crown, x, y, C.inkG);
        p.line(cx, crown, x, y, fan ? (i % 2 ? C.leaf : C.hayL) : C.grassL);
        p.px(x, y, fan ? C.hayL : C.grass);
    }
    if (!fan) {
        p.disc(cx - 4, crown + 2, 2, 2, C.grassD);
        p.disc(cx + 4, crown + 3, 2, 2, C.woodD);
    }
}

function drawPlant(name) {
    const spec = plantSpecs[name];
    const pix = new Pix(spec.w * logical, spec.h * logical);
    spec.draw(pix);
    return pix;
}

const plantSpecs = {
    mandacaru: { w: 2, h: 3, draw: (p) => drawMandacaru(p, false) },
    "mandacaru-flor": { w: 2, h: 3, draw: (p) => drawMandacaru(p, true) },
    xique: { w: 2, h: 2, draw: drawXique },
    facheiro: { w: 2, h: 3, draw: drawFacheiro },
    macambira: { w: 2, h: 2, draw: drawMacambira },
    catingueira: { w: 3, h: 3, draw: (p) => drawBare(p, false, true) },
    "umbu-seco": { w: 3, h: 3, draw: (p) => drawBare(p, true, false) },
    juazeiro: { w: 3, h: 3, draw: (p) => drawCanopy(p, C.leaf, C.leafL, C.inkG, false) },
    "umbu-verde": { w: 3, h: 3, draw: (p) => drawCanopy(p, C.leaf, C.leafL, C.inkG, false, true) },
    carnauba: { w: 2, h: 4, draw: (p) => drawPalm(p, false, true) },
    coqueiro: { w: 2, h: 4, draw: (p) => drawPalm(p, true, false) },
    mangueira: { w: 3, h: 3, draw: (p) => drawCanopy(p, C.mango, C.mangoL, C.inkG, true) },
};

const plantLayout = [
    ["mandacaru", 0, 0],
    ["mandacaru-flor", 2, 0],
    ["xique", 4, 0],
    ["facheiro", 6, 0],
    ["macambira", 8, 1],
    ["catingueira", 0, 3],
    ["umbu-seco", 3, 3],
    ["juazeiro", 6, 3],
    ["carnauba", 0, 6],
    ["coqueiro", 2, 6],
    ["umbu-verde", 4, 6],
    ["mangueira", 7, 6],
];

function paintPlants() {
    const sheet = new Pix(10 * logical, 10 * logical);
    const placed = [];
    for (const [name, col, row] of plantLayout) {
        const spec = plantSpecs[name];
        const pix = drawPlant(name);
        for (let y = 0; y < pix.h; y++) {
            for (let x = 0; x < pix.w; x++) sheet.px(col * logical + x, row * logical + y, pix.get(x, y));
        }
        placed.push({ name, col, row, w: spec.w, h: spec.h });
    }
    return { sheet, placed };
}

const ground = scalePix(paintGrid(groundOrder), scale);
const kit = scalePix(paintKit(), scale);
const built = paintHouses();
const housesSheet = scalePix(built.sheet, scale);
const plants = paintPlants();
const plantSheet = scalePix(plants.sheet, scale);

save("nordeste.png", ground);
save("casas.png", kit);
save("casas-montadas.png", housesSheet);
save("plantas.png", plantSheet);

if (process.argv.includes("--preview")) {
    const preview = new Pix(plantSheet.w, plantSheet.h);
    for (let y = 0; y < preview.h; y += 64) {
        for (let x = 0; x < preview.w; x += 64) preview.fill(x, y, 64, 64, (Math.floor(x / 64) + Math.floor(y / 64)) % 2 ? C.dirtL : C.dirt);
    }
    for (let y = 0; y < plantSheet.h; y++) {
        for (let x = 0; x < plantSheet.w; x++) {
            const color = plantSheet.get(x, y);
            if (color[3] > 0) preview.px(x, y, color);
        }
    }
    save("plantas-preview.png", preview);
    console.log(JSON.stringify({ houses: built.rects, plants: plants.placed }, null, 2));
}
