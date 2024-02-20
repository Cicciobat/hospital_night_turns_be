const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors')
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser')
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const mongoose = require('mongoose');
const {sha256} = require("js-sha256");
const jwt = require('jose');
const {getLoginData, saveTurns, getTurns, closeConnection, connection} = require("./query/query");
const {generateTurns, verifyToken} = require("./process/process");
const secretKey = new TextEncoder().encode(process.env.SECRET_KEY)
const Turns = mongoose.model('turns', new mongoose.Schema({
    turns: [{
        turn: String,
        name: String
    }],
    date: Date
}));
const Users = mongoose.model('users', new mongoose.Schema({
    username: String,
    password: String
}));
require('dotenv').config()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
connection(mongoose).then().catch(error => console.log(error))

app.post('/get-data', async (req, res) => {
    let data = await getTurns(Turns, mongoose);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
            .end(JSON.stringify(data))
});

app.post('/auth', verifyToken,  async (req, res) => {
    return res.status(200).json({message: 'Valid token'})
})

app.post('/login', async (req, res) => {
    const loginData = await getLoginData(Users, mongoose, req);


    if (loginData && (req.body.username === loginData.username && sha256(req.body.password) === loginData.password)) {
        const alg = 'HS256'
        const token = await new jwt.SignJWT(req.body)
            .setProtectedHeader({alg})
            .setIssuedAt(Date.now())
            .setExpirationTime('1h')
            .sign(secretKey);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
            .setHeader('Authorization', token)
            .setHeader('Access-Control-Expose-Headers', 'Authorization')
            .end('ok');
    } else {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json')
            .end('Login failed');
    }
});


io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for chat messages
    socket.on('people', async (people) => {
        const turns = generateTurns(people);
        await saveTurns(Turns, turns);

        // Broadcast the message to all connected clients
        io.emit('people', JSON.stringify(turns.turns));
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
