import { Redis } from "ioredis";
import { config } from "../config";
import { getIO } from "./index";
import { assignmentSockets } from "./index"; // import the map

export const initRedisSubscriber = () => {
  const sub = new Redis(config.redisUri);

  sub.subscribe("generation-updates", (err) => {
    if (err) console.error("Redis subscription error:", err);
  });

  sub.on("message", (channel, message) => {
    console.log("👂 Redis subscriber raw message received on channel", channel);
    if (channel === "generation-updates") {
      try {
        const event = JSON.parse(message);
        console.log(
          "📥 Redis subscriber received:",
          event.type,
          "assignmentId:",
          event.assignmentId,
        );
        const io = getIO();

        // Emit to job‑specific room (if jobId present)
        if (event.jobId) {
          io.to(`job:${event.jobId}`).emit(event.type, event);
        }

        // Emit directly to sockets subscribed by assignmentId
        if (event.assignmentId && assignmentSockets.has(event.assignmentId)) {
          for (const socketId of assignmentSockets.get(event.assignmentId)!) {
            io.to(socketId).emit(event.type, event);
          }
        }
      } catch (e) {
        console.error("Failed to parse pub/sub event", e);
      }
    }
  });

  sub.on("error", (err) => {
    console.error("❌ Redis subscriber error:", err);
  });

  console.log("📡 Redis subscriber listening for generation updates");
};
