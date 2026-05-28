import { Router } from "express";
import multer from "multer";
import path from "path";
import { createExtractionJob } from "../controllers/extraction.controller";

const router: Router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) =>
      cb(null, path.resolve(__dirname, "../../../../uploads")),
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname}`),
  }),
});

router.post("/upload", upload.single("file"), createExtractionJob);

export { router as uploadRouter };
