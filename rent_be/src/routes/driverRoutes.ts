import { Router } from "express";
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../controllers/driverController";

const router = Router();

router.get("/", getDrivers);
router.post("/", createDriver);
router.patch("/:id", updateDriver);
router.delete("/:id", deleteDriver);

export default router;