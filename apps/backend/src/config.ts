import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || "",
  redisUri: process.env.REDIS_URI || "redis://localhost:6379",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  queueName: process.env.QUEUE_NAME || "paper-generation",
};
