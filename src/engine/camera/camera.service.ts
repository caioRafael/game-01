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
    private worldWidth = 0;
    private worldHeight = 0;
    

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
    
    setBounds(width: number, height: number): void {
        this.worldWidth = width;
        this.worldHeight = height;
    }

    update(): void {
        if(this.node !== CameraMode.FOLLOW || this.target === null) return;

        const position = this.target.getPosition();
        const desiredX = position.x + this.target.getWidth() / 2 - this.viewWidth / 2;
        const desiredY = position.y + this.target.getHeight() / 2 - this.viewHeight / 2;
        this.x = this.place(desiredX, this.worldWidth, this.viewWidth);
        this.y = this.place(desiredY, this.worldHeight, this.viewHeight);    
    }

    reset(): void {
        this.worldWidth = 0;
        this.worldHeight = 0;
        this.setFixed(0, 0);
    }

    private place(desired: number, worldSize: number, viewSize: number): number {
        if (worldSize <= 0) return desired;
        if (worldSize <= viewSize) return (worldSize - viewSize) / 2;
        const max = worldSize - viewSize;
        return Math.min(Math.max(desired, 0), max);
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

    getView(): { x: number, y: number, width: number, height: number } {
        return {
            x: this.x,
            y: this.y,
            width: this.viewWidth,
            height: this.viewHeight,
        }
    }
}