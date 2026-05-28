import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "@veda/shared";

// In‑memory map: assignmentId → Set of socket IDs
export const assignmentSockets = new Map<string, Set<string>>();

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

    socket.on("subscribe_to_assignment", (assignmentId: string) => {
      // Register socket for this assignment
      if (!assignmentSockets.has(assignmentId)) {
        assignmentSockets.set(assignmentId, new Set());
      }
      assignmentSockets.get(assignmentId)!.add(socket.id);
      console.log(
        `Client ${socket.id} subscribed to assignment ${assignmentId}`,
      );

      // Clean up on disconnect
      socket.on("disconnect", () => {
        const sockets = assignmentSockets.get(assignmentId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) assignmentSockets.delete(assignmentId);
        }
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
