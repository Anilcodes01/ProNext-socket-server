export const socketConfig = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"],
};
