import { Router } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth";
import {
  regenerateAssignment,
  deleteAssignment,
} from "../controllers/assignment.controller";

const router: Router = Router();

router.post("/:assignmentId/regenerate", optionalAuth, regenerateAssignment);

router.delete("/:assignmentId", requireAuth, deleteAssignment);

export { router as assignmentRouter };
