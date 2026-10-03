import { Game } from "@core/game";

const canvas = document.querySelector("canvas");
if (!canvas) {
  throw new Error("Canvas not found");
}

const game = new Game(canvas);
game.start();