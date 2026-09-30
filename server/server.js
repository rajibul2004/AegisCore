const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const firRoutes = require('./routes/firRoutes');
const caseRoutes = require('./routes/caseRoutes');
const suspectRoutes = require('./routes/suspectRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const statsRoutes = require('./routes/statsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const auditRoutes = require('./routes/auditRoutes');
const testRoutes = require('./routes/testRoutes');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Important for Cloudinary/Map tiles

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Expose the local uploads folder statically for development
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');

  res.status(200).json({
    success: true,
    message: 'Crime Investigation System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
app.use('/api/firs', firRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/suspects', suspectRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/test', testRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Crime Investigation System API' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const http = require('http');
const { initializeSocket } = require('./config/socket');
const startKeepAlive = require('./utils/keepAlive');

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  
  // Initialize Socket.io
  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(`\n=== Server is running on port ${PORT} ===`);
    console.log(`=== Environment: ${process.env.NODE_ENV || 'development'} ===`);
    console.log(`=== Health check: http://localhost:${PORT}/api/health ===\n`);
    
    // Start self-ping mechanism to prevent Render sleep mode
    startKeepAlive();
  });
};

startServer();
