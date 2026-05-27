import { Router } from "express";
import { createGenerationJob } from "../controllers/generation.controller";

const router: Router = Router();

router.post("/start", createGenerationJob);

export { router as generationRouter };
