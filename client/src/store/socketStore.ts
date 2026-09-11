import { create } from 'zustand';
import { OnlineUser } from '../types';

interface SocketState {
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  onlineCount: number;
  setConnected: (isConnected: boolean) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  setOnlineCount: (count: number) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  onlineUsers: [],
  onlineCount: 0,

  setConnected: (isConnected) => set({ isConnected }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers, onlineCount: onlineUsers.length }),
  setOnlineCount: (onlineCount) => set({ onlineCount }),
}));
