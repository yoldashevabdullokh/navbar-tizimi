import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? undefined : 'http://localhost:5000'), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('🟢 Socket.io ulandi:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔴 Socket.io uzildi');
});

export default socket;
