import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const useRealtimeActivity = (options = {}) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) return;

    const token = localStorage.getItem('token');
    const url = window.location.origin;

    const socket = io(url, {
      auth: {
        token,
      },
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('activity', (payload) => {
      try {
        const data = payload?.data || payload;
        setEvents((prev) => [data, ...prev].slice(0, options.maxEvents || 200));
      } catch (err) {
        // ignore
      }
    });

    // Generic event handler - allows subscribing to custom events
    socket.onAny((event, data) => {
      // ignore internal connection events
      if (['connect', 'disconnect'].includes(event)) return;
      // store event
      setEvents((prev) => [{ event, data, receivedAt: new Date() }, ...prev].slice(0, options.maxEvents || 200));
    });

    socket.on('connect_error', (err) => {
      console.error('Realtime connect error', err);
    });

    return socket;
  }, [options.maxEvents]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (err) {
        // ignore
      }
      socketRef.current = null;
    }
    setConnected(false);
  }, []);

  const emit = useCallback((event, payload) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, payload);
    }
  }, []);

  useEffect(() => {
    // auto-connect
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    connected,
    events,
    connect,
    disconnect,
    emit,
  };
};

export default useRealtimeActivity;
