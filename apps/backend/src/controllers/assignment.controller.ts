import { Request, Response } from "express";
import mongoose from "mongoose";
import { generationJobPayloadSchema } from "@veda/shared";
import { AssignmentModel } from "../models/assignment.model";
import { addGenerationJob } from "../queues/generation.queue";
import { getIO } from "../socket";

export const regenerateAssignment = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ error: "Assignment not found" });

    // Use stored breakdown or fallback to empty
    const questionBreakdown = (assignment as any).questionBreakdown || [];
    const totalQuestions =
      questionBreakdown.length > 0
        ? questionBreakdown.reduce(
            (sum: number, item: any) => sum + item.count,
            0,
          )
        : assignment.totalQuestions || 0;
    const marksPerQuestion =
      questionBreakdown.length > 0
        ? questionBreakdown[0].marks
        : assignment.marksPerQuestion || 0;

    // questionTypes from breakdown, then stored, else default
    const questionTypes = assignment.questionTypes?.length
      ? assignment.questionTypes
      : questionBreakdown.length > 0
        ? questionBreakdown.map((item: any) => item.type)
        : ["short-answer"];

    const payload = generationJobPayloadSchema.parse({
      title: assignment.title,
      totalQuestions,
      marksPerQuestion,
      questionTypes,
      questionBreakdown:
        questionBreakdown.length > 0 ? questionBreakdown : undefined,
      additionalInstructions: assignment.additionalInstructions || undefined,
      difficultyPreference: assignment.difficultyPreference || undefined,
      classLevel: (assignment as any).classLevel || undefined,
      institutionName: (assignment as any).institutionName || undefined,
      uploadedContent: assignment.uploadedContent || undefined,
      assignmentId: assignment._id.toString(),
      userId: assignment.userId?.toString() || undefined,
    });

    const job = await addGenerationJob(payload);
    assignment.jobId = job.id;
    assignment.status = "generating";
    await assignment.save();

    getIO().to(`job:${job.id!}`).emit("generation_started", { jobId: job.id! });
    return res.status(201).json({
      message: "Regeneration started",
      jobId: job.id,
      assignmentId: assignment._id,
    });
  } catch (error: any) {
    if (error.issues)
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.issues });
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ error: "Assignment not found" });

    // Check ownership
    const userId = req.authUser?.userId;
    if (!userId || assignment.userId?.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorised to delete this assignment" });
    }

    // Delete associated generated paper (if any)
    const { GeneratedPaperModel } =
      await import("../models/generated-paper.model");
    await GeneratedPaperModel.deleteOne({ assignmentId: assignment._id });

    // Delete the assignment itself
    await assignment.deleteOne();

    return res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return res.status(500).json({ error: "Failed to delete assignment" });
  }
};
