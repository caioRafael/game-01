import { GameObject } from "@entities/game-object";
import { houseSheet, kitCell, nordesteTileSize, type HousePlan } from "@scenes/maps/nordeste-art";

function pieceColor(name: string): string {
    if (name.startsWith("straw") || name.startsWith("adobe") || name.startsWith("baseA") || name === "winA" || name === "doorTA" || name === "doorBA") {
        return "#c47a45";
    }
    if (name.startsWith("pink") || name.startsWith("baseP") || name === "winP" || name === "doorTP" || name === "doorBP") {
        return "#e07a9a";
    }
    if (name.startsWith("yel") || name.startsWith("baseY") || name === "winY" || name === "doorTY" || name === "doorBY" || name === "cobogo") {
        return "#e6c15a";
    }
    if (name.startsWith("clay") || name.startsWith("eave")) return "#b5523a";
    if (name.startsWith("door")) return "#3c6fbf";
    return "#f0e2c4";
}

export class House extends GameObject {
    private readonly spriteX: number;
    private readonly spriteY: number;

    constructor(private readonly plan: HousePlan, column: number, row: number) {
        const widthInTiles = plan.rows[0]?.length ?? 0;
        if (widthInTiles === 0) throw new Error(`Casa sem peças: ${plan.name}`);
        for (const line of plan.rows) {
            if (line.length !== widthInTiles) throw new Error(`Casa irregular: ${plan.name}`);
        }
        if (plan.doorColumn < 0 || plan.doorColumn >= widthInTiles || plan.doorRow < 0 || plan.doorRow + 1 >= plan.rows.length) {
            throw new Error(`Porta fora da casa: ${plan.name}`);
        }
        const spriteX = column * nordesteTileSize;
        const spriteY = row * nordesteTileSize;
        const width = widthInTiles * nordesteTileSize;
        const spriteHeight = plan.rows.length * nordesteTileSize;
        super(spriteX, spriteY + spriteHeight - nordesteTileSize, width, nordesteTileSize, "#f0e2c4");
        this.spriteX = spriteX;
        this.spriteY = spriteY;
    }

    getName(): string {
        return this.plan.name;
    }

    getGreeting(): string {
        return this.plan.greeting;
    }

    doorBounds(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.spriteX + this.plan.doorColumn * nordesteTileSize,
            y: this.spriteY + this.plan.doorRow * nordesteTileSize,
            width: nordesteTileSize,
            height: nordesteTileSize * 2,
        };
    }

    doorAt(x: number, y: number): boolean {
        const door = this.doorBounds();
        return x >= door.x && x < door.x + door.width && y >= door.y && y < door.y + door.height;
    }

    nearPlayer(player: GameObject): boolean {
        const door = this.doorBounds();
        const position = player.getPosition();
        const centerX = position.x + player.getWidth() / 2;
        const centerY = position.y + player.getHeight() / 2;
        const doorCenterX = door.x + door.width / 2;
        const doorCenterY = door.y + door.height / 2;
        return Math.abs(centerX - doorCenterX) <= nordesteTileSize
            && Math.abs(centerY - doorCenterY) <= nordesteTileSize * 2;
    }

    render(ctx: CanvasRenderingContext2D, highlighted = false): void {
        this.plan.rows.forEach((line, row) => {
            line.forEach((name, column) => {
                const cell = kitCell(name);
                const x = this.spriteX + column * nordesteTileSize;
                const y = this.spriteY + row * nordesteTileSize;
                const drawn = houseSheet.draw(
                    ctx,
                    cell.column * nordesteTileSize,
                    cell.row * nordesteTileSize,
                    nordesteTileSize,
                    nordesteTileSize,
                    x,
                    y,
                    nordesteTileSize,
                    nordesteTileSize,
                );
                if (!drawn) {
                    ctx.fillStyle = pieceColor(name);
                    ctx.fillRect(x, y, nordesteTileSize, nordesteTileSize);
                }
            });
        });

        if (!highlighted) return;
        const door = this.doorBounds();
        ctx.fillStyle = "rgba(255, 236, 170, 0.4)";
        ctx.fillRect(door.x, door.y, door.width, door.height);
    }
}
