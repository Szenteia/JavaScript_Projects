// Define the initial player squad
let squad = [
    { name: "Soldier 1", health: 100, morale: 100 },
    { name: "Soldier 2", health: 100, morale: 100 },
    { name: "Soldier 3", health: 100, morale: 100 },
    { name: "Soldier 4", health: 100, morale: 100 },
    { name: "Soldier 5", health: 100, morale: 100 }
];

// Function to display squad status
function displaySquad() {
    let squadDiv = document.getElementById("game-text");
    squadDiv.innerHTML = "<h2>Your Squad:</h2>";
    squad.forEach(member => {
        squadDiv.innerHTML += `<p>${member.name}: Health - ${member.health}, Morale - ${member.morale}</p>`;
    });
}

// Function to display the title and prompt to continue
function displayTitle() {
    let gameDiv = document.getElementById("game-text");
    gameDiv.innerHTML = "<h1>Proven</h1>";
    gameDiv.innerHTML += "<p>Press any button to continue...</p>";
}

// Function to start the game
function startGame() {
    displayTitle();
    // Call function to prompt to continue
    document.addEventListener("keypress", continueGame);
}

// Function to continue the game
function continueGame() {
    // Remove the event listener to prevent multiple calls
    document.removeEventListener("keypress", continueGame);
    // Proceed with the game
    let gameDiv = document.getElementById("game-text");
    gameDiv.innerHTML = ""; // Clear the screen
    // Display the storyline and squad statistics
    gameDiv.innerHTML += "<p>You came from a poor family in a small farming village. Life was hard, but you managed to eke out a living as a farmer, tilling the land day in and day out.</p>";
    gameDiv.innerHTML += "<p>However, your peaceful existence was shattered when news arrived that a hostile neighboring country had invaded your lands, bringing destruction and chaos in their wake.</p>";
    gameDiv.innerHTML += "<p>Feeling a sense of duty and determination to protect your home and loved ones, you made the decision to join the army, knowing that the path ahead would be perilous and fraught with challenges.</p>";
    displaySquad();
    // Call function to begin the first mission
    // missionOne();
}

// Start the game
startGame();
