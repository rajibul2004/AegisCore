const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

// Store connected users to easily emit messages to specific users
// Structure: { userId: socketId }
const connectedUsers = new Map();

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication Middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      
      // Fallback to parsing cookies if auth object is empty
      if (!token && socket.request.headers.cookie) {
        const cookies = socket.request.headers.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'token') {
            token = value;
            break;
          }
        }
      }
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid or inactive user'));
      }

      // Attach user object to socket for later use
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    
    // Map the user ID to their socket ID
    connectedUsers.set(userId, socket.id);
    

    // Broadcast online status to others
    socket.broadcast.emit('user_status_change', {
      userId,
      status: 'online'
    });

    // Handle manual disconnect
    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      
      
      // Broadcast offline status
      io.emit('user_status_change', {
        userId,
        status: 'offline'
      });
    });
  });

  return io;
};

// Helper function to emit to a specific user securely
const emitToUser = (userId, eventName, data) => {
  if (!io) return;
  const socketId = connectedUsers.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(eventName, data);
  }
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIo,
  emitToUser,
  connectedUsers
};
