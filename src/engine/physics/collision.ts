import type { GameObject } from "../../entities/game-object";

export class Collision {
    static checkCollision(object1: GameObject, object2: GameObject): boolean {
        return object1.getPosition().x < object2.getPosition().x + object2.getWidth() &&
            object1.getPosition().x + object1.getWidth() > object2.getPosition().x &&
            object1.getPosition().y < object2.getPosition().y + object2.getHeight() &&
            object1.getPosition().y + object1.getHeight() > object2.getPosition().y;
    }
}