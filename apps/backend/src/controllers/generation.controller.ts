import { Request, Response } from "express";
import { assignmentFormSchema, generationJobPayloadSchema } from "@veda/shared";
import { AssignmentModel } from "../models/assignment.model";
import { addGenerationJob } from "../queues/generation.queue";
import { getIO } from "../socket";

export const createGenerationJob = async (req: Request, res: Response) => {
  try {
    const validatedForm = assignmentFormSchema.parse(req.body);

    // Determine total questions and marks
    let totalQuestions: number = 0;
    let marksPerQuestion: number = 0;
    let questionBreakdown = validatedForm.questionBreakdown;

    if (questionBreakdown && questionBreakdown.length > 0) {
      totalQuestions = questionBreakdown.reduce(
        (sum, item) => sum + item.count,
        0,
      );
      marksPerQuestion = questionBreakdown[0].marks;
    } else if (
      validatedForm.questionTypes &&
      validatedForm.questionTypes.length > 0 &&
      validatedForm.totalQuestions &&
      validatedForm.marksPerQuestion
    ) {
      // convert old flat format
      questionBreakdown = validatedForm.questionTypes.map((type) => ({
        type,
        count: Math.ceil(
          validatedForm.totalQuestions! / validatedForm.questionTypes!.length,
        ),
        marks: validatedForm.marksPerQuestion!,
      }));
      totalQuestions = validatedForm.totalQuestions;
      marksPerQuestion = validatedForm.marksPerQuestion;
    }

    const form = {
      ...validatedForm,
      institutionName:
        validatedForm.institutionName || req.authUser?.institutionName,
      totalQuestions,
      marksPerQuestion,
      questionBreakdown,
    };

    const assignment = await AssignmentModel.create({
      ...form,
      userId: req.authUser?.userId,
      status: "pending",
    });

    const payload = generationJobPayloadSchema.parse({
      ...form,
      assignmentId: assignment._id.toString(),
      userId: req.authUser?.userId,
      uploadedContent: undefined,
    });

    const job = await addGenerationJob(payload);
    assignment.jobId = job.id;
    assignment.status = "generating";
    await assignment.save();

    const jobId = job.id!;
    getIO().to(`job:${jobId}`).emit("generation_started", { jobId });
    return res
      .status(201)
      .json({
        message: "Generation job created",
        jobId,
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
