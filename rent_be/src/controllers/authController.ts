import { Request, Response } from "express";
import User from "../models/user";

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
      res.status(401).json({ message: "Нэвтрэх мэдээлэл буруу байна" });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

// POST /api/auth/seed - Анхны хэрэглэгчдийг үүсгэх
export const seedUsers = async (req: Request, res: Response) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      res.json({ message: "Хэрэглэгчид аль хэдийн байна" });
      return;
    }

    await User.insertMany([
      { name: "Болд Менежер",   username: "manager1", password: "1234", role: "manager" },
      { name: "Сараа Менежер",  username: "manager2", password: "1234", role: "manager" },
      { name: "Дэлгэр Менежер", username: "manager3", password: "1234", role: "manager" },
      { name: "Админ",          username: "admin",    password: "admin", role: "admin" },
    ]);

    res.json({ message: "Хэрэглэгчид үүслээ ✅" });
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};