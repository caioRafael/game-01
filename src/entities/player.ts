import type { InputService } from "@engine/inputs/input.service";
import { Key } from "@engine/inputs/key";
// import { Sprite, type Spritesheet } from "@engine/sprite/spritesheet";
import type { GameContext } from "./scene";
import { GameObject } from "./game-object";

type Facing = "down" | "up" | "left" | "right";

export class Player extends GameObject {
    private readonly speed = 240;
    private readonly drawScale = 2;
    // private readonly sprite: Sprite;
    private facing: Facing = "down";
    private held = { left: false, right: false, up: false, down: false };

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        // sheet: Spritesheet,
        color: string = "red",
    ) {
        super(x, y, width, height, color);
        // this.sprite = new Sprite(sheet, "idle-down");
    }

    update(dt: number, input: InputService, _game: GameContext) {
        const left = input.isPressed(Key.LEFT);
        const right = input.isPressed(Key.RIGHT);
        const up = input.isPressed(Key.UP);
        const down = input.isPressed(Key.DOWN);

        if (left && !this.held.left) this.facing = "left";
        if (right && !this.held.right) this.facing = "right";
        if (up && !this.held.up) this.facing = "up";
        if (down && !this.held.down) this.facing = "down";

        if (left) this.setPosition(this.getPosition().x - this.speed * dt, this.getPosition().y);
        if (right) this.setPosition(this.getPosition().x + this.speed * dt, this.getPosition().y);
        if (up) this.setPosition(this.getPosition().x, this.getPosition().y - this.speed * dt);
        if (down) this.setPosition(this.getPosition().x, this.getPosition().y + this.speed * dt);

        this.held = { left, right, up, down };
        // this.sprite.play(`${left || right || up || down ? "walk" : "idle"}-${this.facing}`);
        // this.sprite.update(dt);
    }

    render(ctx: CanvasRenderingContext2D) {
        const position = this.getPosition();
        const width = this.getWidth() * this.drawScale;
        const height = this.getHeight() * this.drawScale;
        const x = position.x - (width - this.getWidth()) / 2;
        const y = position.y - (height - this.getHeight());
        // const drawn = this.sprite.render(ctx, x, y, width, height);
        // if (!drawn) super.render(ctx);
        super.render(ctx);
    }
}
