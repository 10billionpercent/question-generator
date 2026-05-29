import mongoose, { Schema, Document } from "mongoose";
import { AssignmentForm, QuestionBreakdownItem } from "@veda/shared";

export interface IAssignment extends AssignmentForm, Document {
  status: "pending" | "extracting" | "generating" | "completed" | "failed";
  jobId?: string;
  paperId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  userId?: mongoose.Types.ObjectId;
  uploadedContent?: string;
  questionBreakdown?: QuestionBreakdownItem[];
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: String,
    uploadedContent: { type: String, default: null },
    questionTypes: [{ type: String }],
    totalQuestions: { type: Number, default: 0 },
    marksPerQuestion: { type: Number, default: 0 },
    additionalInstructions: String,
    difficultyPreference: { type: String, enum: ["easy", "medium", "hard"] },
    classLevel: String,
    questionBreakdown: [
      {
        type: {
          type: String,
          enum: [
            "mcq",
            "short-answer",
            "long-answer",
            "true-false",
            "fill-blanks",
            "diagram-graph",
            "numerical",
            "match-following",
          ],
        },
        count: Number,
        marks: Number,
        _id: false,
      },
    ],
    status: { type: String, default: "pending" },
    jobId: String,
    paperId: { type: Schema.Types.ObjectId, ref: "GeneratedPaper" },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, strict: false },
);

export const AssignmentModel = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema,
);
