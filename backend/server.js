const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./app/config/db');

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // React frontend
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
    req.io = io;
    next();
});


io.on('connection', (socket) => {
    console.log('A wizard connected to the Tavern: ', socket.id);
    
    socket.on('join_tavern', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their private tavern booth.`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from the Tavern');
    });
});

// Database Connection
connectDB();

// Import Routes
const authRoutes = require('./app/routes/authRoutes');
const questRoutes = require('./app/routes/questRoutes');
const walletRoutes = require('./app/routes/walletRoutes');
const chatRoutes = require('./app/routes/chatRoutes');
const adminRoutes = require('./app/routes/adminRoutes');
const leaderboardRoutes = require('./app/routes/leaderboardRoutes');
const userRoutes = require('./app/routes/userRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);


app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'SideQuest API is running smoothly!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
