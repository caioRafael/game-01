import type { InputService } from "../engine/inputs/input.service";
import { Key } from "../engine/inputs/key";
import type { GameContext } from "./scene";
import { GameObject } from "./game-object";

export class Player extends GameObject {
    private readonly speed = 240;
    constructor(
        x: number, 
        y: number, 
        width: number, 
        height: number,
        color: string = "red"
    ){
        super(x, y, width, height, color);
    }

    update(dt: number, input: InputService, _game: GameContext){
        if (input.isPressed(Key.LEFT)) this.setPosition(this.getPosition().x - this.speed * dt, this.getPosition().y);
        if (input.isPressed(Key.RIGHT)) this.setPosition(this.getPosition().x + this.speed * dt, this.getPosition().y);
        if (input.isPressed(Key.UP)) this.setPosition(this.getPosition().x, this.getPosition().y - this.speed * dt);
        if (input.isPressed(Key.DOWN)) this.setPosition(this.getPosition().x, this.getPosition().y + this.speed * dt);
    }

}