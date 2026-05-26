import mongoose, { Schema, Document } from "mongoose";
import { GeneratedPaper } from "@veda/shared";

export interface IGeneratedPaper extends GeneratedPaper, Document {
  assignmentId: mongoose.Types.ObjectId;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
  pdfUrl?: string;
}

const questionSchema = new Schema(
  {
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    marks: { type: Number, required: true },
  },
  { _id: false },
);

const sectionSchema = new Schema(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: [questionSchema],
  },
  { _id: false },
);

const generatedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    jobId: { type: String, required: true },
    studentInfo: {
      name: String,
      rollNumber: String,
      date: String,
    },
    sections: [sectionSchema],
    totalMarks: Number,
    duration: String,
    pdfUrl: { type: String, default: null },
  },
  { timestamps: true },
);

export const GeneratedPaperModel = mongoose.model<IGeneratedPaper>(
  "GeneratedPaper",
  generatedPaperSchema,
);
