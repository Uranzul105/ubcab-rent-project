import mongoose, { Schema, Document } from "mongoose";

export interface IDriver extends Document {
  phone: string;
  name: string;
  regno: string;
}

const DriverSchema = new Schema<IDriver>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    regno: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IDriver>("Driver", DriverSchema);