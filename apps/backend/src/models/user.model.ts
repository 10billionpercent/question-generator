import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  emailOrPhone: string;
  institutionName: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    emailOrPhone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    institutionName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
