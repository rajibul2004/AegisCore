import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    // Only connect if the user is authenticated
    if (user && !socket) {
      // Get token from localStorage/cookies to authenticate the socket
      const token = localStorage.getItem('token') || ''; 
      // If we use httpOnly cookies, socket.io sends them automatically if credentials: true

      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true,
        // If we strictly rely on cookies, this is fine. If not, pass auth.
        // auth: { token }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('user_status_change', ({ userId, status }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (status === 'online') newSet.add(userId);
          else newSet.delete(userId);
          return newSet;
        });
      });

      return () => {
        newSocket.disconnect();
      };
    } else if (!user && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
