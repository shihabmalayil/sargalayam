const express = require('express');
const WebSocket = require('ws');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });

let connectedClients = new Set();

app.use(express.static('public'));

wss.on('connection', (ws) => {
    console.log('Client connected');
    connectedClients.add(ws);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch(data.type) {
            case 'programChange':
                updatePrograms(data.programId);
                break;
            default:
                console.log(`Received unknown message type: ${data.type}`);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        connectedClients.delete(ws);
    });
});

function updatePrograms(programId) {
    // This function should send the updated program information to all connected clients
    connectedClients.forEach(client => {
        client.send(JSON.stringify({
            type: 'programUpdate',
            programId: programId
        }));
    });
}

module.exports = app;
