import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../middleware/auth-middleware";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error", { cause: err }));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`User ${user?.id} connected`);

    socket.on("join_project", (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`User ${user?.id} joined room project ${projectId}`);
    });

    socket.on("leave_project", (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`User ${user?.id} left room project ${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User ${user?.id} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
