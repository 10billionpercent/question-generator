import { Request, Response } from "express";
import mongoose from "mongoose";
import { assignmentFormSchema, generationJobPayloadSchema } from "@veda/shared";
import { AssignmentModel } from "../models/assignment.model";
import { addExtractionJob } from "../queues/extraction.queue";
import { getIO } from "../socket";

export const createExtractionJob = async (req: Request, res: Response) => {
  try {
    const validatedForm = assignmentFormSchema.parse(req.body);

    // Fallback institution name from authenticated user
    const institutionName =
      validatedForm.institutionName || req.authUser?.institutionName;

    const userId = req.authUser?.userId
      ? new mongoose.Types.ObjectId(req.authUser.userId)
      : undefined;

    // Create assignment
    const assignment = await AssignmentModel.create({
      ...validatedForm,
      institutionName,
      userId,
      status: "pending",
    });

    // Build job payload
    const payload = generationJobPayloadSchema.parse({
      ...validatedForm,
      institutionName,
      assignmentId: assignment._id.toString(),
      userId: userId?.toString(),
    });

    // Enqueue extraction job (file path is added automatically by multer)
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
    assignment.status = "extracting";
    await assignment.save();

    getIO().to(`job:${job.id!}`).emit("generation_started", { jobId: job.id! });

    return res.status(201).json({
      message: "Extraction job created",
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
