export class ImageSheet {
    private readonly image = new Image();

    constructor(src: string) {
        this.image.src = src;
    }

    draw(
        ctx: CanvasRenderingContext2D,
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        dx: number,
        dy: number,
        dw: number,
        dh: number,
    ): boolean {
        if (!this.image.complete || this.image.naturalWidth === 0) return false;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx.restore();
        return true;
    }
}
