import { Request, Response } from "express";
import Driver from "../models/driver";

// GET /api/drivers
export const getDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

// POST /api/drivers
export const createDriver = async (req: Request, res: Response) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

// PATCH /api/drivers/:id
export const updateDriver = async (req: Request, res: Response) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!driver) {
      res.status(404).json({ message: "Жолооч олдсонгүй" });
      return;
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

// DELETE /api/drivers/:id
export const deleteDriver = async (req: Request, res: Response) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: "Устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};