export class GameObject {
    constructor(
        private x: number,
        private y: number,
        private width: number,
        private height: number,
        private color: string = "red",
        private isTrigger: boolean = false
    ){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isTrigger = isTrigger;
    }

    setPosition(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    getPosition(): { x: number, y: number }{
        return { x: this.x, y: this.y };
    }

    getIsTrigger(): boolean{
        return this.isTrigger;
    }

    getWidth(): number{
        return this.width;
    }

    getHeight(): number{
        return this.height;
    }

    getColor(): string{
        return this.color;
    }

    render(ctx: CanvasRenderingContext2D){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}