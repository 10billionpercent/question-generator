import mongoose, { Schema, Document } from "mongoose";

export interface IUpload extends Document {
  assignmentId: mongoose.Types.ObjectId;
  fileBuffer: Buffer;
  mimetype: string;
  originalName: string;
}

const uploadSchema = new Schema<IUpload>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      unique: true,
    },
    fileBuffer: { type: Buffer, required: true },
    mimetype: { type: String, required: true },
    originalName: { type: String, required: true },
  },
  { timestamps: true },
);

export const UploadModel = mongoose.model<IUpload>("Upload", uploadSchema);
