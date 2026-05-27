import { Router, Request, Response } from "express";
import multer from "multer";
import * as PdfParse from "pdf-parse-new";
import { assignmentFormSchema, generationJobPayloadSchema } from "@veda/shared";
import { AssignmentModel } from "../models/assignment.model";
import { addGenerationJob } from "../queues/generation.queue";
import { getIO } from "../socket";

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      // Validate form fields
      const validatedForm = assignmentFormSchema.parse(req.body);

      let extractedText: string | undefined;
      if (req.file) {
        if (req.file.mimetype === "application/pdf") {
          // pdf-parse-new with native TS support — just pass the buffer
          const result = await PdfParse.default(req.file.buffer);
          extractedText = result.text;
        } else if (
          req.file.mimetype === "text/plain" ||
          req.file.originalname.endsWith(".txt")
        ) {
          extractedText = req.file.buffer.toString("utf-8");
        } else {
          return res.status(400).json({
            error: "Unsupported file type. Please upload a PDF or text file.",
          });
        }
      }

      // Create assignment
      const assignment = await AssignmentModel.create({
        ...validatedForm,
        status: "pending",
      });

      // Prepare job payload
      const payload = generationJobPayloadSchema.parse({
        ...validatedForm,
        assignmentId: assignment._id.toString(),
        uploadedContent: extractedText,
      });

      // Enqueue job
      const job = await addGenerationJob(payload);

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
