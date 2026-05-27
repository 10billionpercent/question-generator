import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config";
import { connectDB } from "./db/mongoose";
import { initSocket } from "./socket";
import { generationRouter } from "./routes/generation.routes";
import { paperRouter } from "./routes/paper.routes";
import { uploadRouter } from "./routes/upload.routes";
import path from "path";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/pdfs", express.static(path.resolve(__dirname, "../../pdfs")));

// Routes
app.use("/api/generation", generationRouter);
app.use("/api/generation", uploadRouter); 
app.use("/api/papers", paperRouter);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Initialize Socket.IO
const io = initSocket(server);

// Connect to DB and start server
connectDB()
  .then(() => {
    server.listen(config.port, () => {
      console.log(`🚀 Backend server running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

export { io };
