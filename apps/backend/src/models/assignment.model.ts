import mongoose, { Schema, Document } from "mongoose";
import { AssignmentForm, QuestionBreakdownItem } from "@veda/shared"; // import QuestionBreakdownItem

export interface IAssignment extends AssignmentForm, Document {
  status: "pending" | "extracting" | "generating" | "completed" | "failed";
  jobId?: string;
  paperId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  userId?: mongoose.Types.ObjectId;
  uploadedContent?: string;
  questionBreakdown?: QuestionBreakdownItem[]; // use the exact type
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    uploadedContent: { type: String, default: null },
    institutionName: String,
    studyMaterialUrl: String,
    dueDate: String,
    questionTypes: [{ type: String, required: true }],
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
          ],
        },
        count: Number,
        marks: Number,
        _id: false,
      },
    ],
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
