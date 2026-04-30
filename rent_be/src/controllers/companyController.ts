import { Request, Response } from "express";
import Company from "../models/company";

// GET /api/companies
export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

// POST /api/companies
export const createCompany = async (req: Request, res: Response) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};

// DELETE /api/companies/:id
export const deleteCompany = async (req: Request, res: Response) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: "Устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа" });
  }
};