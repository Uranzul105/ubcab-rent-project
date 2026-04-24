import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  role: "manager" | "admin";
}

const UserSchema = new Schema<IUser>({
  name:     { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["manager", "admin"], default: "manager" },
});

export default mongoose.model<IUser>("User", UserSchema);