import { Router } from "express";
import { optionalAuth } from "../middleware/auth";
import { regenerateAssignment } from "../controllers/assignment.controller";

const router: Router = Router();

router.post("/:assignmentId/regenerate", optionalAuth, regenerateAssignment);

export { router as assignmentRouter };
