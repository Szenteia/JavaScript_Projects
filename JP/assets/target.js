let target = {
    x: canvas.width - 100,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50
};

function drawTarget(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(target.x, target.y, target.width, target.height);
}
