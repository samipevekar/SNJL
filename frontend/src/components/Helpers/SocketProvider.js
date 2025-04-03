import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { AppState } from 'react-native'; // Import AppState
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
  const appState = useRef(AppState.currentState);

  const initializeSocket = async () => {
    const token = await getToken();
    if (!token) {
      console.error('No token found, cannot initialize socket');
      return;
    }

    socketRef.current = io('http://192.168.255.213:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true,
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

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected, reason:', reason);
      setSocketReady(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      setSocketReady(false);
    });

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

  useEffect(() => {
    initializeSocket();

    // Handle app state changes (foreground/background)
    const handleAppStateChange = (nextAppState) => {
      console.log('AppState changed:', nextAppState);
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('App has come to the foreground');
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
          console.log('Attempting to reconnect socket');
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        console.log('App has gone to the background');
        if (socketRef.current?.connected) {
          socketRef.current.disconnect();
          console.log('Socket disconnected on background');
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
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