import { clipOnRow, Spritesheet } from "@engine/sprite/spritesheet";

const idleDuration = 0.4;
const walkDuration = 0.12;
const attackDuration = 0.12;

function facingClips(row: number, facing: string): Record<string, ReturnType<typeof clipOnRow>> {
    return {
        [`idle-${facing}`]: clipOnRow(row, 0, 2, idleDuration),
        [`walk-${facing}`]: clipOnRow(row, 2, 4, walkDuration),
        [`attack-${facing}`]: clipOnRow(row, 6, 3, attackDuration),
    };
}

export const teenSheet = new Spritesheet("/images/teen/spritesheet.png", 64, 64, {
    ...facingClips(0, "down"),
    ...facingClips(1, "up"),
    ...facingClips(2, "right"),
    ...facingClips(3, "left"),
});
