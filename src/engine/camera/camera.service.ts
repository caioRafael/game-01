import type { GameObject } from "@entities/game-object";

export enum CameraMode {
    FIXED = "fixed",
    FOLLOW = "follow",
}

export class CameraService {
    private x = 0;
    private y = 0;
    private viewWidth = 0;
    private viewHeight = 0;
    private node = CameraMode.FIXED;
    private target: GameObject | null = null;
    

    setViewSize(width: number, height: number): void {
        this.viewWidth = width;
        this.viewHeight = height;
    }

    setFixed(x: number, y: number): void {
        this.node = CameraMode.FIXED;   
        this.target = null;
        this.x = x;
        this.y = y;
    }

    follow(target: GameObject): void {
        this.node = CameraMode.FOLLOW;
        this.target = target;
    }

    update(): void {
        if(this.node !== CameraMode.FOLLOW || this.target === null) return;

        const position = this.target.getPosition();
        this.x = position.x + this.target.getWidth() / 2 - this.viewWidth / 2;
        this.y = position.y + this.target.getHeight() / 2 - this.viewHeight / 2;
    }

    reset(): void {
        this.setFixed(0, 0);
    }

    worldToScreen(x: number, y: number): { x: number, y: number } {
        return {
            x: x - this.x, 
            y: y - this.y,
        }
    }

    screenToWorld(x: number, y: number): { x: number, y: number } {
        return {
            x: x + this.x, 
            y: y + this.y,
        }
    }

    apply(ctx: CanvasRenderingContext2D): void {
        ctx.translate(-this.x, -this.y);
    }
}