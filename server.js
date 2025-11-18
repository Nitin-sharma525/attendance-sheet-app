const express = require('express');
const cors = require("cors");
const app = express();
const path = require('path');
require('dotenv').config();

const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

// custom modules
const { connectdb, startCronJob } = require('./helper/index');
const router = require('./router/index');
const attendanceRoutes = require('./router/attendance');
const noticeRoutes = require('./router/notice');
const syllabusRoutes = require('./router/syllabus');
const performanceRoutes = require('./router/performance');


const chatSocket = require("./socket/chatSocket.js");

const port = process.env.PORT || 4000;

connectdb();
startCronJob();

// middlewares
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Hello world');
});

// routes
app.use('/api/form', router);
app.use('/api/form', attendanceRoutes);
app.use('/api/form', noticeRoutes);
app.use('/api/form', syllabusRoutes);
app.use('/api/form', performanceRoutes);

// SERVER + SOCKET
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

// SOCKET AUTH MIDDLEWARE
io.use((socket, next) => {
    const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.token;

    if (!token) {
        return next(new Error("Authentication error: Token required"));
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.user = user;
        next();
    } catch (err) {
        return next(new Error("Authentication error: Invalid token"));
    }
});

// SOCKET CONNECTION
io.on("connection", (socket) => {
    console.log("User connected:", socket.data.user?.email || socket.id);

    chatSocket(io, socket);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.data.user?.email || socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
