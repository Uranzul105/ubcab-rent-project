import mongoose, { Schema, Document } from "mongoose";

export interface ILog extends Document {
  action: "create" | "update" | "delete";
  targetType: "order" | "driver";
  targetId: string;
  targetName: string;
  userId: number;
  userName: string;
  userRole: string;
  changes?: string;
  createdAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    action: { type: String, enum: ["create", "update", "delete"], required: true },
    targetType: { type: String, enum: ["order", "driver"], required: true },
    targetId: { type: String, required: true },
    targetName: { type: String, required: true },
    userId: { type: Number, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    changes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<ILog>("Log", LogSchema);