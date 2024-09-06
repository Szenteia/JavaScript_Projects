let robot = {
    x: 50,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    speed: 0
};

function drawRobot(ctx) {
    ctx.fillStyle = 'cyan';
    ctx.fillRect(robot.x, robot.y, robot.width, robot.height);
}
