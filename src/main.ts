// 1- conectar a tag canva

import { Game } from "@core/game";
import { RendererService } from "@engine/renderer/renderer.service";

// 2- apresentar um objeto na tela

// 3- animar o objeto

// 4- mover objeto

console.log("Hello World");

const canvas = document.querySelector("canvas");
if (!canvas) {
  throw new Error("Canvas not found");
}

const game = new Game(canvas);
game.start();