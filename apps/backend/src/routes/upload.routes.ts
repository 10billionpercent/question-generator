import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { assignmentFormSchema, generationJobPayloadSchema } from "@veda/shared";
import { AssignmentModel } from "../models/assignment.model";
import { addExtractionJob } from "../queues/extraction.queue";
import { getIO } from "../socket";

const router: Router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, "../../../uploads"),
  }),
});

router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      // Validate form fields
      const validatedForm = assignmentFormSchema.parse(req.body);

      // Create assignment
      const assignment = await AssignmentModel.create({
        ...validatedForm,
        status: "pending",
      });

      // Prepare job payload
      const payload = generationJobPayloadSchema.parse({
        ...validatedForm,
        assignmentId: assignment._id.toString(),
      });

      // Enqueue extraction job
      const job = await addExtractionJob({
        assignmentId: assignment._id.toString(),
        form: payload,
        ...(req.file && {
          file: {
            path: req.file.path,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
          },
        }),
      });

      assignment.jobId = job.id;
      assignment.status = "generating";
      await assignment.save();

      // Notify via WebSocket
      getIO().to(`job:${job.id!}`).emit("generation_started", {
        jobId: job.id!,
      });

      return res.status(201).json({
        message: "Generation job created",
        jobId: job.id,
        assignmentId: assignment._id,
      });
    } catch (error: any) {
      if (error.issues) {
        return res
          .status(400)
          .json({ error: "Validation failed", details: error.issues });
      }
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

export { router as uploadRouter };
