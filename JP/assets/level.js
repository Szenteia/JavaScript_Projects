let currentLevel = 1;
let levels = [
    { targetX: canvas.width - 100, time: 30, obstacles: [] },
    { targetX: canvas.width - 150, time: 25, obstacles: [{x: canvas.width / 2 - 25, y: 100, width: 50, height: 50}] },
    { targetX: canvas.width - 200, time: 20, obstacles: [{x: canvas.width / 2 - 25, y: 100, width: 50, height: 50}, {x: 200, y: 300, width: 50, height: 50}] }
];

function loadLevel(level) {
    let levelData = levels[level - 1];
    target.x = levelData.targetX;
    timeLeft = levelData.time;
    obstacle = levelData.obstacles[0] || null;
    startTimer();
    updateGame();
}

function nextLevel() {
    currentLevel++;
    if (currentLevel > levels.length) {
        alert("Gratulálok, megnyerted a játékot!");
        currentLevel = 1;
    }
    loadLevel(currentLevel);
}
