import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
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
