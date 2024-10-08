import { Howl } from 'howler';

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
playButton.innerText = 'Play Game Sound';
playButton.style.padding = '10px 20px';
playButton.style.fontSize = '16px';
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