import { useSocketStore } from '../store/socketStore';

export function usePresence() {
  const isConnected = useSocketStore((state) => state.isConnected);
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const onlineCount = useSocketStore((state) => state.onlineCount);

  return {
    isConnected,
    onlineUsers,
    onlineCount,
  };
}
