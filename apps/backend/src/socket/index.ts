import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "@veda/shared";

let io: Server<ClientToServerEvents, ServerToClientEvents>;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("subscribe_to_job", (jobId: string) => {
      socket.join(`job:${jobId}`);
      console.log(`Client joined room job:${jobId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
