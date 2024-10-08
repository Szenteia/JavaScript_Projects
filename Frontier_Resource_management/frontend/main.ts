import { Howl } from 'howler';
import { Header } from './components/Header';
import { ResourceDisplay } from './components/ResourceDisplay';
import { GameControls } from './components/GameControls';
import { BadgeDisplay } from './components/BadgeDisplay';
import { ResourceManager } from './components/ResourceManager';
import { UnitPurchase } from './components/UnitPurchase';
import { EnemyManager } from './components/EnemyManager';
import { GameCanvas } from './components/GameCanvas';

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

    const unitPurchase = new UnitPurchase(resourceManager, (unitType: string) => {
        console.log(`${unitType} purchased!`);
        resourceDisplay.updateResources();  
    });
    unitPurchase.render(app);

    const gameControls = new GameControls(
        () => { console.log("Game Started!"); },  
        () => { console.log("Game Paused!"); }    
    );
    gameControls.render(app);

    const badgeDisplay = new BadgeDisplay();
    badgeDisplay.addBadge("First Game Started");
    badgeDisplay.render(app);

    const enemyManager = new EnemyManager();

    const gameCanvas = new GameCanvas(enemyManager);
    gameCanvas.render(app);

    setInterval(() => {
        enemyManager.spawnEnemy('Simple Infantry', 100, 2, 10, Math.random() * gameCanvas.getCanvasWidth(), 0); 
        gameCanvas.update();
        enemyManager.removeDestroyedEnemies();
    }, 1000);
 }