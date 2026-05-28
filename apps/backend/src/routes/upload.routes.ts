import { Router } from "express";
import multer from "multer";
import path from "path";
import { createExtractionJob } from "../controllers/extraction.controller";

const isProduction = (process.env.NODE_ENV || "").trim() === "production";

const storage = isProduction
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) =>
        cb(null, path.resolve(__dirname, "../../../../uploads")),
      filename: (_req, file, cb) =>
        cb(null, `${Date.now()}-${file.originalname}`),
    });

const upload = multer({ storage });

const router: Router = Router();
router.post("/upload", upload.single("file"), createExtractionJob);
export { router as uploadRouter };
