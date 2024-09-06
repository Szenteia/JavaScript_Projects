let obstacle = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50
};

function drawObstacle(ctx) {
    ctx.fillStyle = 'red';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function checkObstacleCollision(robot, obstacle) {
    if (
        robot.x < obstacle.x + obstacle.width &&
        robot.x + robot.width > obstacle.x &&
        robot.y < obstacle.y + obstacle.height &&
        robot.y + robot.height > obstacle.y
    ) {
        alert("Ütköztél egy akadállyal! Próbáld újra.");
        resetGame();
    }
}
