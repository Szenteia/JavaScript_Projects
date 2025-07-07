const computerChoiceDisplay = document.getElementById('computer-choice');
const userChoiceDisplay = document.getElementById('user-choice');
const result = document.getElementById('result');
let userChoice;
let computerChoice;

let wins = 0;
let losses = 0;
let ties = 0;


const winsDisplay = document.getElementById('wins');
const lossesDisplay = document.getElementById('losses');
const tiesDisplay = document.getElementById('ties');
const title = document.getElementById('title');
const gameDiv = document.getElementById('game');
const rulesHolder = document.getElementById('rules-holder');
const rulesDiv = document.getElementById('rules');
const rulesButton = document.createElement('button');

title.addEventListener('click', () => {
    gameDiv.style.display = 'flex';
    title.style.display = 'none';
    rulesDiv.style.display = 'none';
    rulesButton.style.display = 'block';
    computerChoiceDisplay.innerHTML = '';
    userChoiceDisplay.innerHTML = '';
    result.innerHTML = '';
});

rulesButton.innerText = 'Rules';
rulesButton.style.display = 'none';
rulesButton.addEventListener('click', () => {
    rulesDiv.style.display = 'flex';
    rulesButton.style.display = 'none';
});

rulesHolder.appendChild(rulesButton);

document.querySelectorAll('.game-button').forEach(button => {
    button.addEventListener('click', (e) => {
        userChoice = e.target.id;
        userChoiceDisplay.innerHTML = userChoice;
        generateComputerChoice();
        getResult();
    });
});

function generateComputerChoice() {
    const choices = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
    const randomIndex = Math.floor(Math.random() * choices.length);
    computerChoice = choices[randomIndex];
    computerChoiceDisplay.innerHTML = computerChoice;
}

function getResult() {
    if (userChoice === computerChoice) {
        result.innerHTML = "It's a tie!";
        ties++;
        tiesDisplay.innerHTML = ties;
    } else if (
        (userChoice === 'rock' && (computerChoice === 'scissors' || computerChoice === 'lizard')) ||
        (userChoice === 'paper' && (computerChoice === 'rock' || computerChoice === 'spock')) ||
        (userChoice === 'scissors' && (computerChoice === 'paper' || computerChoice === 'lizard')) ||
        (userChoice === 'lizard' && (computerChoice === 'paper' || computerChoice === 'spock')) ||
        (userChoice === 'spock' && (computerChoice === 'rock' || computerChoice === 'scissors'))
    ) {
        result.innerHTML = "You win!";
        wins++;
        winsDisplay.innerHTML = wins;
    } else {
        result.innerHTML = "You lose!";
        losses++;
        lossesDisplay.innerHTML = losses;
    }
}




