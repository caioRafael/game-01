import { GameObject } from "@entities/game-object";
import { nordesteTileSize, plantSheet, plantSpecs, type PlantKind } from "@scenes/maps/nordeste-art";

export class Tree extends GameObject {
    private readonly spriteX: number;
    private readonly spriteY: number;
    private readonly spriteWidth: number;
    private readonly spriteHeight: number;
    private readonly sourceX: number;
    private readonly sourceY: number;

    constructor(kind: PlantKind, column: number, row: number) {
        const spec = plantSpecs[kind];
        const spriteWidth = spec.columns * nordesteTileSize;
        const spriteHeight = spec.rows * nordesteTileSize;
        const trunkWidth = nordesteTileSize * 0.75;
        const trunkHeight = nordesteTileSize * 0.5;
        super(
            column * nordesteTileSize + (spriteWidth - trunkWidth) / 2,
            row * nordesteTileSize + spriteHeight - trunkHeight,
            trunkWidth,
            trunkHeight,
            "#6b4a28",
        );
        this.spriteX = column * nordesteTileSize;
        this.spriteY = row * nordesteTileSize;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.sourceX = spec.column * nordesteTileSize;
        this.sourceY = spec.row * nordesteTileSize;
    }

    render(ctx: CanvasRenderingContext2D): void {
        const drawn = plantSheet.draw(
            ctx,
            this.sourceX,
            this.sourceY,
            this.spriteWidth,
            this.spriteHeight,
            this.spriteX,
            this.spriteY,
            this.spriteWidth,
            this.spriteHeight,
        );
        if (drawn) return;
        ctx.fillStyle = this.getColor();
        ctx.fillRect(this.spriteX, this.spriteY, this.spriteWidth, this.spriteHeight);
    }
}
