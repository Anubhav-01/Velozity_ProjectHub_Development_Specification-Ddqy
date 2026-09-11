export interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  socketId: string;
  connectedAt: Date;
}

class PresenceManager {
  // Map of userId -> Set of socketIds (support multiple tabs/devices)
  private userSockets: Map<string, Set<string>> = new Map();
  // Map of socketId -> user details
  private socketToUser: Map<string, { userId: string; name: string; email: string; role: string }> = new Map();

  addUser(socketId: string, user: { userId: string; name: string; email: string; role: string }): boolean {
    const isFirstConnection = !this.userSockets.has(user.userId) || this.userSockets.get(user.userId)!.size === 0;

    if (!this.userSockets.has(user.userId)) {
      this.userSockets.set(user.userId, new Set());
    }
    this.userSockets.get(user.userId)!.add(socketId);
    this.socketToUser.set(socketId, user);

    return isFirstConnection;
  }

  removeUser(socketId: string): { userId: string; isLastConnection: boolean } | null {
    const user = this.socketToUser.get(socketId);
    if (!user) return null;

    this.socketToUser.delete(socketId);

    const sockets = this.userSockets.get(user.userId);
    if (sockets) {
      sockets.delete(socketId);
      const isLastConnection = sockets.size === 0;
      if (isLastConnection) {
        this.userSockets.delete(user.userId);
      }
      return { userId: user.userId, isLastConnection };
    }

    return null;
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  getOnlineUsers(): Array<{ userId: string; name: string; email: string; role: string }> {
    const seen = new Set<string>();
    const result: Array<{ userId: string; name: string; email: string; role: string }> = [];

    for (const [, user] of this.socketToUser) {
      if (!seen.has(user.userId)) {
        seen.add(user.userId);
        result.push(user);
      }
    }

    return result;
  }

  getOnlineUserCount(): number {
    return this.userSockets.size;
  }
}

const presenceManager = new PresenceManager();

export function getPresenceManager(): PresenceManager {
  return presenceManager;
}
