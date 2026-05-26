import { Request, Response } from "express";
import { assignmentFormSchema, generationJobPayloadSchema } from "@veda/shared";
import { AssignmentModel } from "../models/assignment.model";
import { addGenerationJob } from "../queues/generation.queue";
import { getIO } from "../socket";

export const createGenerationJob = async (req: Request, res: Response) => {
  try {
    const validatedForm = assignmentFormSchema.parse(req.body);

    // Save assignment with pending status
    const assignment = await AssignmentModel.create({
      ...validatedForm,
      status: "pending",
    });

    // Extract uploaded content if present (simplified: in real app parse PDF)
    const payload = generationJobPayloadSchema.parse({
      ...validatedForm,
      assignmentId: assignment._id.toString(),
      uploadedContent: undefined, // will be filled if file upload exists
    });

    // Add to queue
    const job = await addGenerationJob(payload);

    // Update assignment with job id
    assignment.jobId = job.id;
    assignment.status = "generating";
    await assignment.save();

    // Notify via WebSocket (optional: room for this assignment)
    const jobId = job.id!;
    getIO().to(`job:${jobId}`).emit("generation_started", { jobId });
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
};
