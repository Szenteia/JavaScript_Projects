const computerChoiceDisplay = document.getElementById('computer-choice');
const userChoiceDisplay = document.getElementById('user-choice');
const result = document.getElementById('result');
const possibleChoices = document.querySelectorAll('button');
let userChoice;
let computerChoice;

const title = document.getElementById('title');
const gameDiv = document.getElementById('game');

title.addEventListener('click', () => {
    gameDiv.style.display = 'flex';
    title.style.display = 'none';
}
);
const rulesHolder = document.getElementById('rules-holder');
const rulesDiv = document.getElementById('rules');
const rulesButton = document.createElement('button');
rulesButton.innerText = 'Rules';
rulesButton.addEventListener('click', () => {
    rulesDiv.style.display = 'flex';
    rulesButton.style.display = 'block';
});

rulesHolder.appendChild(rulesButton);

possibleChoices.forEach(possibleChoice => possibleChoice.addEventListener('click', (e) => {
    userChoice = e.target.id;
    userChoiceDisplay.innerHTML = userChoice;
    generateComputerChoice();
    getResult();
}));

function generateComputerChoice() {
    const randomNumber = Math.floor(Math.random() * possibleChoices.length);
    if (randomNumber === 0) {
        computerChoice = 'rock';
    }
    if (randomNumber === 1) {
        computerChoice = 'paper';
    }
    if (randomNumber === 2) {
        computerChoice = 'scissors';
    }
    if (randomNumber === 3) {
        computerChoice = 'lizard';
    }
    if (randomNumber === 4) {
        computerChoice = 'spock';
    }
    computerChoiceDisplay.innerHTML = computerChoice;
}

    function getResult() {
        if (userChoice === computerChoice) {
            result.innerHTML = "It's a tie!";
        } else if (
            (userChoice === 'rock' && (computerChoice === 'scissors' || computerChoice === 'lizard')) ||
            (userChoice === 'paper' && (computerChoice === 'rock' || computerChoice === 'spock')) ||
            (userChoice === 'scissors' && (computerChoice === 'paper' || computerChoice === 'lizard')) ||
            (userChoice === 'lizard' && (computerChoice === 'paper' || computerChoice === 'spock')) ||
            (userChoice === 'spock' && (computerChoice === 'rock' || computerChoice === 'scissors'))
        ) {
            result.innerHTML = "You win!";
        } else {
            result.innerHTML = "You lose!";

        }
    }