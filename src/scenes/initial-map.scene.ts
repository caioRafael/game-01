import { SceneId } from "@core/persisted-game";
import type { CameraService } from "@engine/camera/camera.service";
import type { InputService } from "@engine/inputs/input.service";
import { MouseButton } from "@engine/inputs/mouse";
import { House } from "@entities/house";
import { Player } from "@entities/player";
import { teenSheet } from "@entities/teen.sheet";
import { Tree } from "@entities/tree";
import type { GameObject } from "@entities/game-object";
import { Scene, type GameContext } from "@entities/scene";
import { Anchor } from "@ui/anchor";
import { Button, TextAlign } from "@ui/button";
import { Label } from "@ui/label";
import { InitialScene } from "./initial.scene";
import { initialMap, initialMapHouses, initialMapSpawn, initialMapTrees } from "./maps/initial-map.map";

function overlaps(x: number, y: number, width: number, height: number, object: GameObject): boolean {
    const position = object.getPosition();
    return x < position.x + object.getWidth()
        && x + width > position.x
        && y < position.y + object.getHeight()
        && y + height > position.y;
}

export class InitialMapScene extends Scene {
    readonly id = SceneId.InitialMap;

    private viewWidth = 0;
    private viewHeight = 0;
    private camera: CameraService | null = null;
    private mouseDown = false;
    private notice = "";
    private noticeTime = 0;
    private hoveredHouse: House | null = null;

    private readonly map = initialMap;
    private readonly player: Player;
    private readonly houses: House[];
    private readonly trees: Tree[];
    private readonly solids: GameObject[];

    private backButton: Button = new Button(0, 0, 50, 50, "Back", "16px Arial", "white", "blue")
        .setAnchor(Anchor.TOP_LEFT, 20, 20);
    private label: Label = new Label(0, 0, 640, 32, "Player:", "16px Arial", "white", TextAlign.LEFT)
        .setAnchor(Anchor.TOP_LEFT, 84, 36);

    constructor() {
        super();
        const spawn = this.map.tileToWorld(initialMapSpawn.column, initialMapSpawn.row);
        this.player = new Player(spawn.x, spawn.y, 64, 64, teenSheet);
        this.houses = initialMapHouses.map((entry) => new House(entry.plan, entry.column, entry.row));
        this.trees = initialMapTrees.map((entry) => new Tree(entry.kind, entry.column, entry.row));
        this.solids = [...this.houses, ...this.trees];
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
        this.camera.setBounds(this.map.getWidth(), this.map.getHeight());

        this.backButton.setOnClick(() => {
            game.changeScene(new InitialScene());
        });
        this.backButton.update(input);

        const previous = this.player.getPosition();
        this.player.update(dt, input, game);
        const attempted = this.player.getPosition();
        const width = this.player.getWidth();
        const height = this.player.getHeight();

        let x = attempted.x;
        let y = previous.y;
        if (this.blocked(x, y, width, height)) x = previous.x;
        y = attempted.y;
        if (this.blocked(x, y, width, height)) y = previous.y;
        this.player.setPosition(x, y);

        game.camera.follow(this.player);
        game.camera.update();

        const mouse = input.getMousePosition();
        const world = game.camera.screenToWorld(mouse.x, mouse.y);
        const mouseDown = input.isMousePressed(MouseButton.LEFT);
        const clicked = mouseDown && !this.mouseDown;
        this.mouseDown = mouseDown;
        this.hoveredHouse = this.houses.find((house) => house.doorAt(world.x, world.y)) ?? null;

        if (clicked && !this.backButton.isHovered(input) && this.hoveredHouse) {
            if (this.hoveredHouse.nearPlayer(this.player)) {
                this.notice = this.hoveredHouse.getGreeting();
                this.noticeTime = 2.4;
            } else {
                this.notice = "Chegue mais perto da porta.";
                this.noticeTime = 1.6;
            }
        }

        let text = `Player: ${game.session.playerName}`;
        if (this.noticeTime > 0) {
            this.noticeTime -= dt;
            text = this.notice;
        } else if (this.hoveredHouse?.nearPlayer(this.player)) {
            text = this.hoveredHouse.getName();
        }
        this.label.setText(text);
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        ctx.fillStyle = "#1d140e";
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        this.camera?.apply(ctx);
        ctx.imageSmoothingEnabled = false;
        this.map.render(ctx, this.camera?.getView() ?? { x: 0, y: 0, width, height });

        const drawables: { depth: number; paint: (ctx: CanvasRenderingContext2D) => void }[] = [];
        for (const house of this.houses) {
            const highlighted = house === this.hoveredHouse;
            drawables.push({
                depth: house.getPosition().y + house.getHeight(),
                paint: (context) => house.render(context, highlighted),
            });
        }
        for (const tree of this.trees) {
            drawables.push({
                depth: tree.getPosition().y + tree.getHeight(),
                paint: (context) => tree.render(context),
            });
        }
        const feet = this.player.getPosition().y + this.player.getHeight();
        drawables.push({
            depth: feet,
            paint: (context) => this.player.render(context),
        });
        drawables.sort((a, b) => a.depth - b.depth);
        for (const drawable of drawables) drawable.paint(ctx);
        ctx.restore();

        this.backButton.render(ctx);
        this.label.render(ctx);
    }

    private blocked(x: number, y: number, width: number, height: number): boolean {
        if (this.map.overlapsSolid(x, y, width, height)) return true;
        return this.solids.some((solid) => overlaps(x, y, width, height, solid));
    }
}
