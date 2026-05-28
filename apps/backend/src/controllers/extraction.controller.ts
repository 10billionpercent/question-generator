import { Request, Response } from "express";
import mongoose from "mongoose";
import { assignmentFormSchema, generationJobPayloadSchema } from "@veda/shared";
import { AssignmentModel } from "../models/assignment.model";
import { UploadModel } from "../models/upload.model";
import {
  addExtractionJob,
  ExtractionJobPayload,
} from "../queues/extraction.queue";
import { getIO } from "../socket";

export const createExtractionJob = async (req: Request, res: Response) => {
  try {
    const validatedForm = assignmentFormSchema.parse(req.body);
    const institutionName =
      validatedForm.institutionName || req.authUser?.institutionName;
    const form = {
      ...validatedForm,
      institutionName,
    };
    const userId = req.authUser?.userId
      ? new mongoose.Types.ObjectId(req.authUser.userId)
      : undefined;

    const assignment = await AssignmentModel.create({
      ...form,
      institutionName,
      userId,
      status: "pending",
    });

    const isProduction = (process.env.NODE_ENV || "").trim() === "production";

    // Build extraction job payload – always contains assignmentId
    const extractionJobPayload: ExtractionJobPayload = {
      assignmentId: assignment._id.toString(),
      form: generationJobPayloadSchema.parse({
        ...form,
        assignmentId: assignment._id.toString(),
        userId: req.authUser?.userId,
      }),
    };

    if (req.file) {
      if (isProduction) {
        // Production: store file buffer in Upload model for later retrieval
        await UploadModel.create({
          assignmentId: assignment._id,
          fileBuffer: req.file.buffer,
          mimetype: req.file.mimetype,
          originalName: req.file.originalname,
        });
        // No file info in payload – worker will read from DB
      } else {
        // Development: attach file metadata (disk storage)
        extractionJobPayload.file = {
          path: req.file.path,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
        };
      }
    }

    // Enqueue extraction job
    const job = await addExtractionJob(extractionJobPayload);

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
