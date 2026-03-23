const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./app/config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB();

// Import Routes
const authRoutes = require('./app/routes/authRoutes');
const questRoutes = require('./app/routes/questRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});