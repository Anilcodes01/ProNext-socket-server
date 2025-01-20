import { UserManager } from "../managers/userManager.js";
import { createMessage } from "../services/chatService.js";
import { findOrCreateChat } from "../services/chatService.js";

 export class SocketHandlers {
  constructor(io) {
    this.io = io;
    this.userManager = new UserManager();
  }

  handleRegister(socket, userId) {
    if (!userId) {
      console.error("Register attempt with invalid userId:", userId);
      return;
    }

    this.userManager.registerUser(userId, socket.id);
    socket.data.userId = userId;
    console.log(`User ${userId} registered with socketId: ${socket.id}`);

    socket.emit("registered", { status: "success", socketId: socket.id });
  }

  async handleMessage(socket, message) {
    console.log("Received message:", message);
    const { content, senderId, receiverId } = message;

    if (!content || !senderId || !receiverId) {
      console.error("Invalid message format:", message);
      socket.emit("messageError", { error: "Invalid message format" });
      return;
    }

    const isReceiverOnline = this.userManager.isUserOnline(receiverId);
    console.log(`Receiver ${receiverId} online status:`, isReceiverOnline);

    try {
      const chat = await findOrCreateChat(senderId, receiverId);
      const savedMessage = await createMessage(
        content,
        senderId,
        receiverId,
        chat.id
      );

      console.log("Message saved:", savedMessage.id);

      socket.emit("messageSaved", savedMessage);

      if (isReceiverOnline) {
        const receiverSockets = this.userManager.getUserSockets(receiverId);
        console.log(
          `Emitting to receiver sockets: `,
          Array.from(receiverSockets)
        );

        receiverSockets.forEach((socketId) => {
          this.io.to(socketId).emit("receiveMessage", savedMessage);
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.emit("messageError", {
        error: "Failed to process message",
        details: error instanceof Error ? error.message : " Unknown error",
      });
    }
  }

  handleDisconnect(socket) {
    const userId = socket.data.userId;
    console.log(`Client disconnected: ${socket.id}, userId: ${userId}`);

    const remainingSockets = this.userManager.removeSocket(userId, socket.id);
    console.log(
      `Updated socket map for user ${userId}:`,
      remainingSockets
        ? `${remainingSockets} active sockets`
        : "No active sockets"
    );
  }
}
