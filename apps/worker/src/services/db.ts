import mongoose from "mongoose";
import { config } from "../config";
import { GeneratedPaper } from "@veda/shared";
import { AssignmentModel } from "../models/assignment.model";
import { GeneratedPaperModel } from "../models/generated-paper.model";

let connected = false;
export const connectDB = async () => {
  if (connected) return;
  await mongoose.connect(config.mongoUri);
  connected = true;
  console.log("✅ Worker MongoDB connected");
};

export const saveGeneratedPaper = async (
  assignmentId: string | undefined,
  jobId: string,
  paper: GeneratedPaper,
  userId?: string,
) => {
  await connectDB();
  if (!assignmentId) throw new Error("assignmentId missing");
  return GeneratedPaperModel.create({
    assignmentId: new mongoose.Types.ObjectId(assignmentId),
    ...(userId && { userId: new mongoose.Types.ObjectId(userId) }),
    jobId,
    ...paper,
  });
};

export const updateAssignmentStatus = async (
  assignmentId: string | undefined,
  status: string,
  paperId?: string,
) => {
  if (!assignmentId) return;
  await AssignmentModel.findByIdAndUpdate(assignmentId, {
    status,
    ...(paperId && { paperId: new mongoose.Types.ObjectId(paperId) }),
  });
};
