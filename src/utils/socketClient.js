// Simple Socket.IO client helper for the React app (Vite)
// Usage:
// 1. Install dependency in client: `cd client && npm install socket.io-client`
// 2. import { connectSocket, onEvent, offEvent, disconnectSocket } from './utils/socketClient'
// 3. connectSocket(token) and register handlers, e.g. onEvent('order:updated', handler)

import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token, options = {}) {
  if (socket && socket.connected) return socket;

  const serverUrl = import.meta.env.VITE_API_URL.replace('/api', '');
  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    ...options,
  });

  socket.on('connect', () => {
    console.log('[socket] connected', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[socket] connect_error', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected', reason);
  });

  return socket;
}

export function onEvent(event, handler) {
  if (!socket) return null;
  socket.on(event, handler);
  return () => offEvent(event, handler);
}

export function offEvent(event, handler) {
  if (!socket) return;
  socket.off(event, handler);
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

// Convenience default listeners (example)
export function listenOrderUpdates(handler) {
  return onEvent('order:updated', (payload) => handler(payload));
}

export function listenDeliveryUpdates(handler) {
  return onEvent('order:delivery:update', (payload) => handler(payload));
}

export function listenOrderAssigned(handler) {
  return onEvent('order:assigned', (payload) => handler(payload));
}
