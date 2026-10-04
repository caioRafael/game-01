import { tileDefinitions, type TileDefinition, type TileId } from "./tile";

export class TileMap {
    private readonly cells: number[];

    constructor(
        private readonly columns: number,
        private readonly rows: number,
        private readonly tileSize: number,
        rowsData: number[][],
    ) {
        this.cells = rowsData.flat();
    }

    getTileSize(): number {
        return this.tileSize;
    }

    getWidth(): number {
        return this.columns * this.tileSize;
    }

    getHeight(): number {
        return this.rows * this.tileSize;
    }

    tileToWorld(column: number, row: number): { x: number, y: number } {
        return {
            x: column * this.tileSize,
            y: row * this.tileSize,
        };
    }

    worldToTile(x: number, y: number): { column: number, row: number } {
        return {
            column: Math.floor(x / this.tileSize),
            row: Math.floor(y / this.tileSize),
        };
    }

    getTile(column: number, row: number): TileDefinition | null {
        if (column < 0 || row < 0 || column >= this.columns || row >= this.rows) return null;
        const id = this.cells[row * this.columns + column] as TileId;
        return tileDefinitions[id] ?? null;
    }

    isSolid(column: number, row: number): boolean {
        const tile = this.getTile(column, row);
        if (tile === null) return true;
        return tile.solid;
    }

    isTrigger(column: number, row: number): boolean {
        return this.getTile(column, row)?.trigger ?? false;
    }

    overlapsSolid(x: number, y: number, width: number, height: number): boolean {
        return this.coveredTiles(x, y, width, height).some((tile) => this.isSolid(tile.column, tile.row));
    }

    overlapsTrigger(x: number, y: number, width: number, height: number): boolean {
        return this.coveredTiles(x, y, width, height).some((tile) => this.isTrigger(tile.column, tile.row));
    }

    render(
        ctx: CanvasRenderingContext2D,
        view: { x: number, y: number, width: number, height: number },
    ): void {
        const startColumn = Math.max(0, Math.floor(view.x / this.tileSize));
        const startRow = Math.max(0, Math.floor(view.y / this.tileSize));
        const endColumn = Math.min(this.columns - 1, Math.ceil((view.x + view.width) / this.tileSize) - 1);
        const endRow = Math.min(this.rows - 1, Math.ceil((view.y + view.height) / this.tileSize) - 1);

        for (let row = startRow; row <= endRow; row++) {
            for (let column = startColumn; column <= endColumn; column++) {
                const tile = this.getTile(column, row);
                if (tile === null) continue;
                const position = this.tileToWorld(column, row);
                ctx.fillStyle = tile.color;
                ctx.fillRect(position.x, position.y, this.tileSize, this.tileSize);
            }
        }
    }

    private coveredTiles(x: number, y: number, width: number, height: number): { column: number, row: number }[] {
        const left = Math.floor(x / this.tileSize);
        const top = Math.floor(y / this.tileSize);
        const right = Math.floor((x + width - 1) / this.tileSize);
        const bottom = Math.floor((y + height - 1) / this.tileSize);
        const tiles: { column: number, row: number }[] = [];

        for (let row = top; row <= bottom; row++) {
            for (let column = left; column <= right; column++) {
                tiles.push({ column, row });
            }
        }

        return tiles;
    }
}