import mongoose, { Schema, Document } from "mongoose";
import { AssignmentForm } from "@veda/shared";

export interface IAssignment extends AssignmentForm, Document {
  status: "pending" | "extracting" | "generating" | "completed" | "failed";
  jobId?: string;
  paperId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  userId?: mongoose.Types.ObjectId;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    institutionName: String,
    studyMaterialUrl: String,
    dueDate: String,
    questionTypes: [{ type: String, required: true }],
    totalQuestions: { type: Number, default: 0 },
    marksPerQuestion: { type: Number, default: 0 },
    additionalInstructions: String,
    difficultyPreference: { type: String, enum: ["easy", "medium", "hard"] },
    classLevel: String,
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "extracting", "generating", "completed", "failed"],
    },
    jobId: String,
    paperId: { type: Schema.Types.ObjectId, ref: "GeneratedPaper" },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const AssignmentModel = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema,
);
