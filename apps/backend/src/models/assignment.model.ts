import mongoose, { Schema, Document } from "mongoose";
import { AssignmentForm } from "@veda/shared";

export interface IAssignment extends AssignmentForm, Document {
  status: "pending" | "generating" | "completed" | "failed";
  jobId?: string;
  paperId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    studyMaterialUrl: String,
    dueDate: String,
    questionTypes: [{ type: String, required: true }],
    totalQuestions: { type: Number, required: true },
    marksPerQuestion: { type: Number, required: true },
    additionalInstructions: String,
    difficultyPreference: { type: String, enum: ["easy", "medium", "hard"] },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "generating", "completed", "failed"],
    },
    jobId: String,
    paperId: { type: Schema.Types.ObjectId, ref: "GeneratedPaper" },
  },
  { timestamps: true },
);

export const AssignmentModel = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema,
);
