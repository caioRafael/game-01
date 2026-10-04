import { defaultPersistedGame, parsePersistedGame, type PersistedGame } from "./persisted-game";

export async function loadPersistedGame(): Promise<PersistedGame> {
    try {
        const response = await fetch("/game-state");
        if (!response.ok) return { ...defaultPersistedGame };
        const parsed = parsePersistedGame(await response.json());
        return parsed ?? { ...defaultPersistedGame };
    } catch {
        return { ...defaultPersistedGame };
    }
}

export function savePersistedGame(state: PersistedGame): void {
    fetch("/game-state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
        keepalive: true,
    }).catch((error: unknown) => {
        console.warn("Não foi possível guardar a cena.", error);
    });
}
