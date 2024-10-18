import { Howl } from 'howler';
import { Header } from './components/Header';
import { ResourceDisplay } from './components/ResourceDisplay';
import { GameControls } from './components/GameControls';
import { BadgeDisplay } from './components/BadgeDisplay';
import { ResourceManager } from './components/ResourceManager';
import { UnitPurchase } from './components/UnitPurchase';
import { EnemyManager } from './components/EnemyManager';
import { GameCanvas } from './components/GameCanvas';
import { Base } from './components/Base';
import { DefenseManager } from './components/DefenseManager';

const ws = new WebSocket("ws://localhost:8000/ws");

ws.onopen = () => {
    console.log("Connected to WebSocket server");
    ws.send("server online");
};

ws.onerror = (error) => {
    console.error("Websocket error occured: ", error);
}

ws.onmessage = (event) => {
    console.log("message from server: ", event.data);
};

ws.onclose = () => {
    console.log("disconnected form WebSocket server");
};

const playButton = document.createElement('button');
playButton.innerText = 'Game Sound';
playButton.style.padding = '10px 20px';
playButton.style.color = 'darkgreen';
playButton.style.fontSize = '14px';
playButton.style.marginTop = '20px';
document.body.appendChild(playButton);

//sound initialization
let sound: Howl | null = null;

playButton.addEventListener('click', () => {
    if (!sound) {
        sound = new Howl({
            src: ['assets/sounds/varyag_war_drum.mp3'],
            volume: 1.1,
        });
    }

    if (sound.playing()) {
        sound.pause();
    } else {
        sound.play();
    }
});

const app = document.getElementById('app');

if (app) {

    const header = new Header();
    header.render(app);

    const resourceManager = new ResourceManager(500);  

    const resourceDisplay = new ResourceDisplay(resourceManager);
    resourceDisplay.render(app);


    const gameControls = new GameControls(
        () => { console.log("Game Started!"); },  
        () => { console.log("Game Paused!"); }    
    );
    gameControls.render(app);


    const base = new Base(1000, 5);
    const enemyManager = new EnemyManager();
    const defenseManager = new DefenseManager(window.innerWidth, base);

    const gameCanvas = new GameCanvas(enemyManager, defenseManager, base);
    gameCanvas.render(app);

    const unitPurchase = new UnitPurchase(resourceManager, (unitType: string) => {
        console.log(`Purchasing unit: ${unitType}`);
        defenseManager.placeDefenseUnit(unitType, 50,100, 1000, 150);
     //   console.log(`Unit placed at position: ${JSON.stringify(defenseManager.getDefenses().map(unit => unit.getPosition()))}`);
     //   console.log(`${unitType} purchased!`);
        resourceDisplay.updateResources();  
        gameCanvas.update();
    });
    unitPurchase.render(app);

    const badgeDisplay = new BadgeDisplay();
    badgeDisplay.addBadge("First Game Started");
    badgeDisplay.render(app);


    // Game state variables
    let currentRound = 0;
    let waveCounter = 0;
    const maxWavesPerRound = 3;
    let roundInterval: number;

    function startNewRound() {
        currentRound++;
        waveCounter = 0;
        console.log(`Round ${currentRound} started!`);
      //  defenseManager.deployReserveUnits();
        
        spawnNextWave();


        roundInterval = setInterval(() => {
            if (waveCounter < maxWavesPerRound) {
                spawnNextWave();
            } else {
                endRound();
            }
        }, 5000);  // Time between waves within a round
    }

    // Function to spawn the next wave
    function spawnNextWave() {
        waveCounter++;
        console.log(`Wave ${waveCounter} in Round ${currentRound} started!`);

        // Example of spawning 5 enemy units randomly positioned along the x-axis
        for (let i = 0; i < 5; i++) {
            enemyManager.spawnEnemy(
                'Simple Infantry', 100,10, 2, 10,  // type, health,range, speed, attackPower
                Math.random() * gameCanvas.getCanvas().width, 0  // random x-position, starting at y=0
            );
        }

        gameCanvas.update();
    }


    function endRound() {
        console.log(`Round ${currentRound} ended!`);
        clearInterval(roundInterval);  // Stop spawning new waves

        defenseManager.resetAttacks();
    }
    setInterval(() => {
        gameCanvas.update();
        enemyManager.moveEnemies(); 
        enemyManager.attackBase(base); 
        enemyManager.removeDestroyedEnemies();

        base.render(gameCanvas.getCanvas().getContext('2d')!);  

        if (base.isDestroyed()) {
            console.log("Base has been destroyed! Game Over.");
            clearInterval(roundInterval);
            return;
        }

    }, 1000);

    startNewRound();
}