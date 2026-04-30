import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import orderRoutes from "./routes/orderRoutes";
import driverRoutes from "./routes/driverRoutes";
import authRoutes from "./routes/authRoutes";
import logRoutes from "./routes/logRoutes";  
import companyRoutes from "./routes/companyRoutes"; 

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ubcab_rent";

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes); 
app.use("/api/companies", companyRoutes);


app.get("/", (req, res) => {
  res.json({ message: "UBCab Rent API ажиллаж байна 🚀" });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB холбогдлоо ✅");
    app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB алдаа:", err));