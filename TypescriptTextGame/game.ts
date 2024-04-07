// Import necessary components
import { Squad } from "./squad";
import { Mission } from "./mission";

// Start game function
export function startGame() {
    // Initialize squad
    const playerSquad = new Squad();

    // Start first mission
    const mission = new Mission();
    mission.start(playerSquad);
}
