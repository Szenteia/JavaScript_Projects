import { Howl } from 'howler';
import { Header } from './components/Header';
import { ResourceDisplay } from './components/ResourceDisplay';
import { GameControls } from './components/GameControls';
import { BadgeDisplay } from './components/BadgeDisplay';

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
    const resourceDisplay = new ResourceDisplay();
    resourceDisplay.render(app);
    const header = new Header();
    header.render(app);

    const gameControls = new GameControls(
        () => { console.log("Game Started!"); },  
        () => { console.log("Game Paused!"); }    
    );
    gameControls.render(app);


    const badgeDisplay = new BadgeDisplay();
    badgeDisplay.addBadge("First Game Started");
    badgeDisplay.render(app);
 }