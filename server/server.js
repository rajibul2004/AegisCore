// ============================================
// Entry Point - Crime Investigation System API
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse incoming JSON data
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));


app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');

  res.status(200).json({
    success: true,
    message: 'Crime Investigation System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Crime Investigation System API' });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n=== Server is running on port ${PORT} ===`);
    console.log(`=== Environment: ${process.env.NODE_ENV || 'development'} ===`);
    console.log(`=== Health check: http://localhost:${PORT}/api/health ===\n`);
  });
};

startServer();
