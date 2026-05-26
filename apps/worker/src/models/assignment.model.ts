import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  status: "pending" | "generating" | "completed" | "failed";
  jobId?: string;
  paperId?: mongoose.Types.ObjectId;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: String,
    status: { type: String, default: "pending" },
    jobId: String,
    paperId: { type: Schema.Types.ObjectId, ref: "GeneratedPaper" },
  },
  { timestamps: true, strict: false },
);

export const AssignmentModel = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema,
);
