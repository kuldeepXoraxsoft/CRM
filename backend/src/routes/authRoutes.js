import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  login,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { authenticate } from "../middleware/auth.js";

const router = Router();

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

router.post("/login", login);
router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password", resetLimiter, resetPassword);

router.get("/me", authenticate, me);
router.patch("/password", authenticate, changePassword);

export default router;