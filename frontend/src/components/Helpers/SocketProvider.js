// SocketProvider.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { getToken } from '../../storage/AuthStorage';
import { getUserData } from '../../storage/userData';
import { setUserOnlineStatus } from '../../store/slices/onlineStatusSlice';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const userRef = useRef(null);
  const [socketReady, setSocketReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeSocket = async () => {
      const token = await getToken();
      if (!token) {
        console.error('No token found, cannot initialize socket');
        return;
      }

      socketRef.current = io('http://192.168.43.111:5000', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        setSocketReady(true);
        if (userRef.current?._id) {
          socketRef.current.emit('userActive', {
            userId: userRef.current._id,
            userType: userRef.current.type,
          });
          console.log('Emitted userActive on connect:', userRef.current._id);
        }
      });

      socketRef.current.on('reconnect', (attempt) => {
        console.log('Socket reconnected after', attempt, 'attempts');
        setSocketReady(true);
        if (userRef.current?._id) {
          socketRef.current.emit('userActive', {
            userId: userRef.current._id,
            userType: userRef.current.type,
          });
          console.log('Emitted userActive on reconnect:', userRef.current._id);
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketReady(false);
        // Note: We don't emit userInactive here because the server should handle the disconnect event
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        setSocketReady(false);
      });

      // Set up global onlineStatus listener
      socketRef.current.on('onlineStatus', (data) => {
        console.log('Received global onlineStatus:', data);
        dispatch(setUserOnlineStatus({ userId: data.userId, status: data.status }));
      });

      // Fetch user data and set it
      const userData = await getUserData();
      userRef.current = userData;
      if (socketRef.current?.connected && userData?._id) {
        socketRef.current.emit('userActive', {
          userId: userData._id,
          userType: userData.type,
        });
        console.log('Emitted userActive after fetching user data:', userData._id);
      }
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected on cleanup');
      }
    };
  }, [dispatch]);

  const setUser = (user) => {
    userRef.current = user;
    if (socketRef.current?.connected && user?._id) {
      socketRef.current.emit('userActive', {
        userId: user._id,
        userType: user.type,
      });
      console.log('Emitted userActive after setting user:', user._id);
    }
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, socketReady, setUser }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};