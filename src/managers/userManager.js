export class UserManager {
  constructor() {
    this.userSocketMap = new Map();
  }

  registerUser(userId, socketId) {
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set());
    }
    this.userSocketMap.get(userId).add(socketId);
  }

  removeSocket(userId, socketId) {
    if (userId && this.userSocketMap.has(userId)) {
      const userSockets = this.userSocketMap.get(userId);
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.userSocketMap.delete(userId);
      }
      return userSockets.size;
    }
    return 0;
  }

  isUserOnline(userId) {
    return (
      this.userSocketMap.has(userId) && this.userSocketMap.get(userId).size > 0
    );
  }

  getUserSockets(userId) {
    return this.userSocketMap.get(userId) || new Set();
  }
}
