import { Request, Response } from "express";
import Log from "../models/log";

// GET /api/logs
export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

// POST /api/logs
export const createLog = async (req: Request, res: Response) => {
  try {
    const log = new Log(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};