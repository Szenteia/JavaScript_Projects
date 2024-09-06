const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Kód futtatása a szerkesztőből
document.getElementById('run-button').addEventListener('click', () => {
    const userCode = document.getElementById('code-editor').value;
    try {
        eval(userCode);  // A játékos által beírt kód végrehajtása
        robot.x += robot.speed; // A robot mozgatása a kódban meghatározott sebességgel
        updateGame();
    } catch (e) {
        alert('Hiba történt a kód futtatása közben: ' + e.message);
    }
});

// Játék visszaállítása a következő szintre
function resetGame() {
    robot.x = 50;
    robot.speed = 0;
    resetTimer();
    loadLevel(currentLevel);
}

// Robot, célpont, akadály és időzítő rajzolásának frissítése
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRobot(ctx);
    drawTarget(ctx);
    if (obstacle) drawObstacle(ctx);
    drawTimer(ctx);
    if (obstacle) checkObstacleCollision(robot, obstacle);
}

// Játék indítása
loadLevel(currentLevel);
updateGame();
