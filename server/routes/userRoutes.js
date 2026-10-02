import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile,
} from "../controllers/userController.js";

import {
  sendEmailVerificationCode,
  verifyEmailCode,
} from "../controllers/emailVerificationController.js";

import { getCurrentUser } from "../controllers/meController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/profile", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getCurrentUser);

router.post("/email-verification/send", authMiddleware, sendEmailVerificationCode);
router.post("/email-verification/verify", authMiddleware, verifyEmailCode);

export default router;