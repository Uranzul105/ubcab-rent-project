import { Router } from "express";
import { login, seedUsers } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/seed", seedUsers);

export default router;