const ws = new WebSocket("ws://localhost:8000/ws");

ws.onopen = () => {
    console.log("Connected to WebSocket server");
    ws.send("server online");
};

ws.onmessage = (event) => {
    console.log("message from server: ", event.data);
};

ws.onclose = () => {
    console.log("disconnected form WebSocket server");
};