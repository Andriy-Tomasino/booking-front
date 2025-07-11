import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/config';

let socket: Socket | null = null;

export const connectSocket = (onComputersStatus: (data: any[]) => void) => {
  socket = io(API_URL, { transports: ['websocket'] });

  socket.on('connect', () => {
    console.log('Connected to WebSocket');
    socket?.emit('requestComputersStatus');
  });

  socket.on('computersStatus', onComputersStatus);

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket');
  });

  socket.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};