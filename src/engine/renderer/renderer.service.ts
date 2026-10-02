import type { Scene } from "@entities/scene";

export class RendererService {
    private currentScene: Scene | null = null;

    constructor(private canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        window.addEventListener("resize", () => this.render());
    }

    // Função para renderizar o canvas
    render() {
        const pixelRatio = window.devicePixelRatio || 1;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.canvas.width = Math.floor(width * pixelRatio);
        this.canvas.height = Math.floor(height * pixelRatio);

        const ctx: CanvasRenderingContext2D | null = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Context not found");
        }

        ctx.scale(pixelRatio, pixelRatio);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

        this.currentScene?.render(ctx, width, height);
    }

    setCurrentScene(scene: Scene) {
        this.currentScene = scene;
        return this;
    }
}