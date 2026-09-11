import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import { QueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function initializeSocket(queryClient: QueryClient): Socket | null {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    disconnectSocket();
    return null;
  }

  // Disconnect existing if any
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    useSocketStore.getState().setConnected(true);
  });

  socket.on('disconnect', () => {
    useSocketStore.getState().setConnected(false);
  });

  // Presence Events
  socket.on('presence:init', (data: { onlineUsers: any[]; count: number }) => {
    useSocketStore.getState().setOnlineUsers(data.onlineUsers);
  });

  socket.on('presence:update', (data: { onlineUsers: any[]; count: number }) => {
    useSocketStore.getState().setOnlineUsers(data.onlineUsers);
    // Invalidate admin dashboard to reflect online count
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
  });

  // Activity Events
  socket.on('activity:new', (activity: any) => {
    queryClient.invalidateQueries({ queryKey: ['activity'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });

  socket.on('activity:missed', (activities: any[]) => {
    queryClient.invalidateQueries({ queryKey: ['activity'] });
  });

  // Task Status Events
  socket.on('task:status:updated', (payload: any) => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['task', payload.taskId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });

  // Notification Events
  socket.on('notification:new', (notification: any) => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    useSocketStore.getState().setConnected(false);
    useSocketStore.getState().setOnlineUsers([]);
  }
}
