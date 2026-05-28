import mongoose, { Schema, Document } from "mongoose";
import { GeneratedPaper } from "@veda/shared";

export interface IGeneratedPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  jobId: string;
  subject: string;
  classLevel: string;
  timeAllowed: string;
  maxMarks: number;
  compulsoryNote: string;
  sections: GeneratedPaper["sections"];
  studentInfo?: GeneratedPaper["studentInfo"];
  totalMarks?: number;
  duration?: string;
  pdfUrl?: string;
  pdfData?: Buffer;
  institutionName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema(
  {
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Difficult"],
      required: true,
    },
    marks: { type: Number, required: true },
    answerHint: { type: String, required: false },
    options: [
      {
        label: { type: String },
        text: { type: String },
        _id: false, // don't create separate IDs for each option
      },
    ],
  },
  { _id: false },
);

const sectionSchema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true }, // ✅ type field added
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
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    institutionName: { type: String, default: null },
    subject: { type: String, required: true },
    classLevel: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    compulsoryNote: { type: String, required: true },
    sections: [sectionSchema],
    studentInfo: {
      name: { type: String, default: "" },
      rollNumber: { type: String, default: "" },
      classSection: { type: String, default: "" },
    },
    totalMarks: { type: Number },
    duration: { type: String },
    pdfUrl: { type: String, default: null },
    pdfData: { type: Schema.Types.Buffer, default: null },
  },
  { timestamps: true },
);

export const GeneratedPaperModel = mongoose.model<IGeneratedPaper>(
  "GeneratedPaper",
  generatedPaperSchema,
);
