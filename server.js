const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { updateGlobalTvScreenData, getUpdatedTvScreenData } = require('./tv-screen');
const http = require('http');
const WebSocket = require('ws');
const connectToDatabase = require('./db');
const Programs = require('./model/programs');
require('dotenv').config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// CORS configuration
const allowedOrigins = ['http://localhost:3000',
    'http://192.168.1.11:3000',
    'https://api.openweathermap.org',
    'sargalayam.onrender.com:3000',
'https://sargalayam.onrender.com:3000'];
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200
}));


// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define the port
const PORT = process.env.PORT || 3000;

// Serve the programs.json file
app.get('/programs.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'programs.json'));
});

async function main() {

    await connectToDatabase();

}
main();
// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('A client connected');
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        //handleMessage(message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Function to broadcast messages to all connected clients
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Serve the dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/stage1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stage.html'));
});
app.get('/stage2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stage.html'));
});
app.get('/stage3', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stage.html'));
});
app.get('/stage4', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stage.html'));
});

app.get('/stage-programs', async (req, res) => {
    try {
        const programs = await Programs.find();
        res.json(programs).status(200);
    } catch (err) {
        res.json('error').status(400);
    }
});

app.get('/programs-by-stage/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const programs = await Programs.find({stage: id});
        res.json(programs).status(200);
    } catch (err) {
        res.json('error').status(400);
    }
});
app.get('/update-status/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const program = await Programs.findById(id);
        program.status = (program.status <=1) ? 2 : 0;
        program.save();
        res.json(program).status(200);
    } catch (err) {
        res.json('error').status(400);
    }
});
app.post('/add-programs', async (req, res) => {
    console.log(req.body);
    try {
        const newProgram = new Programs(req.body);
        const savedProgram = await newProgram.save();
        res.json(savedProgram).status(200);
    } catch (err) {
        res.json('error').status(400);
    }
});

// Handle POST requests to /tv-browser
app.post('/tv-browser', async (req, res) => {
    const { programId, stageTitle } = req.body;
    const program = await Programs.findById(programId);
    program.status = 1;
    await program.save();
    broadcast(JSON.stringify(req.body));
    res.json('Success');
});
//Handle POST news
app.post('/news', (req, res) => {
    const { programId, stageTitle } = req.body;
    broadcast(JSON.stringify(req.body));
    res.json('Success');
});

// Serve the TV screen view page
app.get('/tv-screen', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tv-browser-view.html'));
});

app.get('/weather', async (req, res) => {
    try {
        const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=10.9408507260116&lon=76.00830256549898&units=metric&appid=e7b9dac8fdb36d2d63ffa45644ec22c8';
        const response = await fetch(apiUrl);
        const data = await response.json();
        res.json(data);  // Send data back to frontend
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching weather data');
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});