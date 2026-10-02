import { Key } from "./key"

export class InputService {

    private keys = new Set<string>()

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keys.add(event.code)
    }

    private handleKeyUp = (event: KeyboardEvent) => {
        this.keys.delete(event.code)
    }

    constructor(){
        window.addEventListener("keydown", this.handleKeyDown)
        window.addEventListener("keyup", this.handleKeyUp)
    }

    isPressed(key: Key){
        return this.keys.has(key)
    }

    destroy(){
        window.removeEventListener("keydown", this.handleKeyDown)
        window.removeEventListener("keyup", this.handleKeyUp)
    }
}
