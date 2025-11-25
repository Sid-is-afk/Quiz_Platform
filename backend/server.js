require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const quizRoutes = require('./routes/quizRoutes');
const socketHandler = require('./socket/socketHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/quizzes', quizRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// HTTP Server & Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? "*" : ["http://localhost:5173", "http://localhost:5000"],
        methods: ["GET", "POST"]
    }
});

// Initialize Socket Handler
socketHandler(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
