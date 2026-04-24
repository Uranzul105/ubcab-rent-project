import { Request, Response } from "express";
import Order from "../models/order";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = new Order({ ...req.body, status: "new", paid: false });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ message: "Захиалга олдсонгүй" });
      return;
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};