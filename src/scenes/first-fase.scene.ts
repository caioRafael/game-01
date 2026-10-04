// import { SceneId } from "@core/persisted-game";
// import type { CameraService } from "@engine/camera/camera.service";
// import type { InputService } from "@engine/inputs/input.service";
// import { Scene, type GameContext } from "@entities/scene";
// import { Player } from "@entities/player";
// import { GameObject } from "@entities/game-object";
// import { Collision } from "@engine/physics/collision";
// import { InitialScene } from "./initial.scene";
// import { MouseButton } from "@engine/inputs/mouse";
// import { Anchor } from "@ui/anchor";
// import { Button, TextAlign } from "@ui/button";
// import { Label } from "@ui/label";

// export class FirstFaseScene extends Scene {
//     readonly id = SceneId.FirstFase;

//     private x = 0;
//     private y = 0;
//     private placed = false;
//     private viewWidth = 0;
//     private viewHeight = 0;
//     private camera: CameraService | null = null;

//     private doorColor = "blue";

//     private backButton: Button = new Button(0, 0, 50, 50, "Back", "16px Arial", "white", "blue")
//         .setAnchor(Anchor.TOP_LEFT, 20, 20);
//     private label: Label = new Label(0, 0, 220, 32, "Player:", "16px Arial", "white", TextAlign.RIGHT)
//         .setAnchor(Anchor.TOP_RIGHT, -16, 24);

//     private player: Player = new Player(this.x, this.y, 100, 100); 
//     private door: GameObject = new GameObject(this.x, this.y, 100, 100, this.doorColor, false);
//     private obstacles: { object: GameObject, color: string }[] = ["orange", "purple", "teal", "yellow", "brown"].map((color) => ({
//         object: new GameObject(0, 0, 100, 100, color, false),
//         color,
//     }));

    
//     layout(width: number, height: number): void {
//         this.viewWidth = width;
//         this.viewHeight = height;
//         this.backButton.place(0, 0, width, height);
//         this.label.place(0, 0, width, height);
//     }

//     update(dt: number, input: InputService, game: GameContext): void {
//         this.camera = game.camera;
//         this.camera.setViewSize(this.viewWidth, this.viewHeight);
//         const playerPreviousPosition = this.player.getPosition();
//         this.label.setText(`Player: ${game.session.playerName}`);
//         this.backButton.setOnClick(() => {
//             game.changeScene(new InitialScene());
//         });
//         this.backButton.update(input);
//         this.player.update(dt, input, game);
//         const blocks = [this.door, ...this.obstacles.map((obstacle) => obstacle.object)];
//         for (const block of blocks) {
//             if (!Collision.checkCollision(this.player, block)) continue;
//             console.log("Colisão detectada");
//             if (block.getIsTrigger()) {
//                 game.changeScene(new InitialScene());
//                 return;
//             }

//             this.player.setPosition(playerPreviousPosition.x, playerPreviousPosition.y);
//             break;
//         }

//         game.camera.follow(this.player);
//         game.camera.update();

//         const mouse = input.getMousePosition();
//         const world = game.camera.screenToWorld(mouse.x, mouse.y);

//         if(input.mouseHovering(this.door, world)) {
//             this.door.setColor("gray");
//         } else {
//             this.door.setColor(this.doorColor);
//         }

//         for (const obstacle of this.obstacles) {
//             if (input.mouseHovering(obstacle.object, world)) {
//                 obstacle.object.setColor("gray");
//             } else {
//                 obstacle.object.setColor(obstacle.color);
//             }
//         }

//         if(input.isMousePressed(MouseButton.LEFT)) {
//             console.log("Mouse pressionado");
//             console.log("Mouse position: ", world);
//         }
//     }

//     render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
//         // trecho de código especifico para posicionar o player na tela, apenas uma vez na cena
//         if (!this.placed) {
//             this.x = width / 2;
//             this.y = height / 2;
//             this.player.setPosition(this.x, this.y);
//             this.door.setPosition(this.x + 100, this.y + 100);
//             for (const obstacle of this.obstacles) {
//                 const object = obstacle.object;
//                 object.setPosition(
//                     Math.random() * Math.max(0, width - object.getWidth()),
//                     Math.random() * Math.max(0, height - object.getHeight()),
//                 );
//             }
//             this.placed = true;
//         }

//         ctx.fillStyle = "black";
//         ctx.fillRect(0, 0, width, height);

//         ctx.save();
//         this.camera?.apply(ctx);
//         this.player.render(ctx);
//         this.door.render(ctx);
//         for (const obstacle of this.obstacles) {
//             obstacle.object.render(ctx);
//         }
//         ctx.restore();

//         this.backButton.render(ctx);
//         this.label.render(ctx);
//     }
// }

import { SceneId } from "@core/persisted-game";
import type { CameraService } from "@engine/camera/camera.service";
import type { InputService } from "@engine/inputs/input.service";
import { Scene, type GameContext } from "@entities/scene";
import { Player } from "@entities/player";
import { InitialScene } from "./initial.scene";
import { Anchor } from "@ui/anchor";
import { Button, TextAlign } from "@ui/button";
import { Label } from "@ui/label";
import { TileId } from "@engine/tilemap/tile";
import { firstFaseMap, firstFaseSpawn } from "./maps/first-fase.map";

export class FirstFaseScene extends Scene {
    readonly id = SceneId.FirstFase;

    private viewWidth = 0;
    private viewHeight = 0;
    private camera: CameraService | null = null;
    private hoveredTile: { column: number, row: number } | null = null;

    private readonly map = firstFaseMap;
    private readonly player: Player;

    private backButton: Button = new Button(0, 0, 50, 50, "Back", "16px Arial", "white", "blue")
        .setAnchor(Anchor.TOP_LEFT, 20, 20);
    private label: Label = new Label(0, 0, 220, 32, "Player:", "16px Arial", "white", TextAlign.RIGHT)
        .setAnchor(Anchor.TOP_RIGHT, -16, 24);

    constructor() {
        super();
        const spawn = this.map.tileToWorld(firstFaseSpawn.column, firstFaseSpawn.row);
        this.player = new Player(spawn.x, spawn.y, 60, 60);
    }

    layout(width: number, height: number): void {
        this.viewWidth = width;
        this.viewHeight = height;
        this.backButton.place(0, 0, width, height);
        this.label.place(0, 0, width, height);
    }

    update(dt: number, input: InputService, game: GameContext): void {
        this.camera = game.camera;
        this.camera.setViewSize(this.viewWidth, this.viewHeight);
        this.camera.setViewSize(this.viewWidth, this.viewHeight);
        this.camera.setBounds(this.map.getWidth(), this.map.getHeight());

        this.label.setText(`Player: ${game.session.playerName}`);
        this.backButton.setOnClick(() => {
            game.changeScene(new InitialScene());
        });
        this.backButton.update(input);

        // const previous = this.player.getPosition();
        // this.player.update(dt, input, game);

        // const position = this.player.getPosition();
        // if (this.map.overlapsSolid(position.x, position.y, this.player.getWidth(), this.player.getHeight())) {
        //     this.player.setPosition(previous.x, previous.y);
        // }

        const previous = this.player.getPosition();
        this.player.update(dt, input, game);

        const attempted = this.player.getPosition();
        const width = this.player.getWidth();
        const height = this.player.getHeight();
        const enteredTrigger = this.map.overlapsTrigger(attempted.x, attempted.y, width, height);

        if (this.map.overlapsSolid(attempted.x, attempted.y, width, height)) {
            this.player.setPosition(previous.x, previous.y);
        }
        if (enteredTrigger) {
            game.changeScene(new InitialScene());
            return;
        }

        const resolved = this.player.getPosition();
        if (this.map.overlapsTrigger(resolved.x, resolved.y, this.player.getWidth(), this.player.getHeight())) {
            game.changeScene(new InitialScene());
            return;
        }

        game.camera.follow(this.player);
        game.camera.update();

        const mouse = input.getMousePosition();
        const world = game.camera.screenToWorld(mouse.x, mouse.y);
        const hovered = this.map.worldToTile(world.x, world.y);
        this.hoveredTile = this.map.getTile(hovered.column, hovered.row)?.id === TileId.Door ? hovered : null;
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        this.camera?.apply(ctx);
        this.map.render(ctx, this.camera?.getView() ?? { x: 0, y: 0, width, height });

        if (this.hoveredTile !== null) {
            const position = this.map.tileToWorld(this.hoveredTile.column, this.hoveredTile.row);
            ctx.fillStyle = "gray";
            ctx.fillRect(position.x, position.y, this.map.getTileSize(), this.map.getTileSize());
        }

        this.player.render(ctx);
        ctx.restore();

        this.backButton.render(ctx);
        this.label.render(ctx);
    }
}