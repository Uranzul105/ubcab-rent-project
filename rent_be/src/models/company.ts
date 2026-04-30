import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  regno: string;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true },
    regno: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>("Company", CompanySchema);