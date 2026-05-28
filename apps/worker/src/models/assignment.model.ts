import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  status: "pending" | "generating" | "completed" | "failed";
  userId?: mongoose.Types.ObjectId;
  jobId?: string;
  paperId?: mongoose.Types.ObjectId;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: String,
    status: { type: String, default: "pending" },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    jobId: String,
    paperId: { type: Schema.Types.ObjectId, ref: "GeneratedPaper" },
  },
  { timestamps: true, strict: false },
);

export const AssignmentModel = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema,
);
