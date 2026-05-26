import { Redis } from "ioredis";
import { config } from "../config";
import { getIO } from "./index";

export const initRedisSubscriber = () => {
  const sub = new Redis(config.redisUri);

  sub.subscribe("generation-updates", (err) => {
    if (err) console.error("Redis subscription error:", err);
  });

  sub.on("message", (channel, message) => {
    if (channel === "generation-updates") {
      try {
        const event = JSON.parse(message);
        const io = getIO();

        switch (event.type) {
          case "generation_progress":
            io.to(`job:${event.jobId}`).emit("generation_progress", {
              jobId: event.jobId,
              progress: event.progress,
            });
            break;
          case "generation_completed":
            io.to(`job:${event.jobId}`).emit("generation_completed", {
              jobId: event.jobId,
              paperId: event.paperId,
              paper: event.paper,
            });
            break;
          case "generation_failed":
            io.to(`job:${event.jobId}`).emit("generation_failed", {
              jobId: event.jobId,
              error: event.error,
            });
            break;
        }
      } catch (e) {
        console.error("Failed to parse pub/sub event", e);
      }
    }
  });

  console.log("📡 Redis subscriber listening for generation updates");
};
