const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Crime Investigation System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Crime Investigation System API' });
});


app.listen(PORT, () => {
  console.log(`\n=== Server is running on port ${PORT} ===`);
  console.log(`=== Environment: ${process.env.NODE_ENV || 'development'} ===`);
  console.log(`=== Health check: http://localhost:${PORT}/api/health ===\n`);
});
