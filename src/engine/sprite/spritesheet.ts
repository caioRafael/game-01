export type SpriteCell = {
    column: number;
    row: number;
};

export type SpriteClip = {
    frames: SpriteCell[];
    duration: number;
};

export function clipOnRow(row: number, startColumn: number, count: number, duration: number): SpriteClip {
    return {
        duration,
        frames: Array.from({ length: count }, (_, index) => ({
            column: startColumn + index,
            row,
        })),
    };
}

export class Spritesheet {
    private readonly image = new Image();

    constructor(
        src: string,
        private readonly cellWidth: number,
        private readonly cellHeight: number,
        private readonly clips: Record<string, SpriteClip>,
    ) {
        this.image.src = src;
    }

    clip(name: string): SpriteClip | null {
        return this.clips[name] ?? null;
    }

    draw(
        ctx: CanvasRenderingContext2D,
        name: string,
        frame: number,
        x: number,
        y: number,
        width: number,
        height: number,
    ): boolean {
        const cell = this.clips[name]?.frames[frame];
        if (!cell || !this.image.complete || this.image.naturalWidth === 0) return false;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.image,
            cell.column * this.cellWidth,
            cell.row * this.cellHeight,
            this.cellWidth,
            this.cellHeight,
            x,
            y,
            width,
            height,
        );
        return true;
    }
}

export class Sprite {
    private name: string;
    private frame = 0;
    private time = 0;

    constructor(
        private readonly sheet: Spritesheet,
        name: string,
    ) {
        this.name = name;
    }

    play(name: string): void {
        if (name === this.name) return;
        this.name = name;
        this.frame = 0;
        this.time = 0;
    }

    update(dt: number): void {
        const clip = this.sheet.clip(this.name);
        if (!clip || clip.frames.length === 0 || clip.duration <= 0) return;

        this.time += dt;
        while (this.time >= clip.duration) {
            this.time -= clip.duration;
            this.frame = (this.frame + 1) % clip.frames.length;
        }
    }

    render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): boolean {
        return this.sheet.draw(ctx, this.name, this.frame, x, y, width, height);
    }
}
