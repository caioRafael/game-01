import type { GameObject } from "@entities/game-object"
import { Key } from "./key"
import type { MouseButton } from "./mouse"

export class InputService {

    private keys = new Set<string>()
    private typedKeys: string[] = []
    private buttons = new Set<number>()
    private mouse = { x: 0, y: 0 }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keys.add(event.code)
        if (event.key === "Backspace" || event.key.length === 1) {
            this.typedKeys.push(event.key)
            event.preventDefault()
        }
    }

    private handleKeyUp = (event: KeyboardEvent) => {
        this.keys.delete(event.code)
    }

    private handleMouseDown = (event: MouseEvent) => {
        this.buttons.add(event.button)
        this.updateMouse(event)
    }
    private handleMouseUp = (event: MouseEvent) => {
        this.buttons.delete(event.button)
        this.updateMouse(event)
    }
    private handleMouseMove = (event: MouseEvent) => {
        this.updateMouse(event)
    }
    private handleBlur = () => {
        this.keys.clear()
        this.buttons.clear()
    }

    constructor(private canvas: HTMLCanvasElement) {
        window.addEventListener("keydown", this.handleKeyDown)
        window.addEventListener("keyup", this.handleKeyUp)
        window.addEventListener("mousedown", this.handleMouseDown)
        window.addEventListener("mouseup", this.handleMouseUp)
        window.addEventListener("mousemove", this.handleMouseMove)
        window.addEventListener("blur", this.handleBlur)
        this.canvas.addEventListener("contextmenu", (event) => event.preventDefault())
    }

    private updateMouse(event: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect()
        this.mouse.x = event.clientX - rect.left
        this.mouse.y = event.clientY - rect.top
    }

    getMousePosition(): { x: number, y: number } {
        return this.mouse
    }

    mouseHovering(gameObject: GameObject): boolean {
        return this.mouse.x >= gameObject.getPosition().x && this.mouse.x <= gameObject.getPosition().x + gameObject.getWidth() && this.mouse.y >= gameObject.getPosition().y && this.mouse.y <= gameObject.getPosition().y + gameObject.getHeight()
    }

    isMousePressed(button: MouseButton): boolean {
        return this.buttons.has(button)
    }

    isPressed(key: Key){
        return this.keys.has(key)
    }

    consumeTypedKeys(): string[] {
        const keys = this.typedKeys
        this.typedKeys = []
        return keys
    }

    destroy(){
        window.removeEventListener("keydown", this.handleKeyDown)
        window.removeEventListener("keyup", this.handleKeyUp)
    }
}
