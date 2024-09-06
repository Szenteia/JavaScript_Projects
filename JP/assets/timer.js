let timeLeft = 30;
let timerInterval;

function drawTimer(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText("Hátralévő idő: " + timeLeft + "s", 20, 30);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateGame();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Lejárt az idő! Próbáld újra.");
            resetGame();
        }
    }, 1000);
}

function resetTimer() {
    timeLeft = 30;
    clearInterval(timerInterval);
}
