import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  date: string;
  customerName: string;
  totalAmount: number;
  status: "new" | "active" | "done" | "cancelled";
  paid: boolean;
  managerId: number;
  managerName: string;
  orderType?: "sales" | "operations"; 
  drivers: {
    phone: string;
    name: string;
    salary: number;
    fuel: number;
     transferred: boolean;
     transferredAt?: string; 
     regno?: string;  
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
    orderType: { type: String, enum: ["sales", "operations"] },
    drivers: [
      {
        phone: String,
        name: String,
        salary: Number,
        fuel: { type: Number, default: 0 },
         transferred: { type: Boolean, default: false },
         transferredAt: { type: String, default: "" }, 
         regno: { type: String, default: "" },  
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);