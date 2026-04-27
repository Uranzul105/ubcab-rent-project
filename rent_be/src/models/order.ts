import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  date: string;
  customerName: string;
  totalAmount: number;
  status: "new" | "active" | "done" | "cancelled";
  paid: boolean;
  managerId: number;
  managerName: string;
  drivers: {
    phone: string;
    name: string;
    salary: number;
    fuel: number;
  }[];
}

const OrderSchema = new Schema<IOrder>(
  {
    date: { type: String, required: true },
    customerName: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["new", "active", "done", "cancelled"],
      default: "new",
    },
    paid: { type: Boolean, default: false },
    managerId: { type: Number, required: true },
    managerName: { type: String, required: true },
    drivers: [
      {
        phone: String,
        name: String,
        salary: Number,
        fuel: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);