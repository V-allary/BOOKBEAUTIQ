import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  submitVerification,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../controllers/verificationController.js";

const router = express.Router();

router.patch("/submit", authMiddleware, roleMiddleware("business"), submitVerification);
router.get("/pending", authMiddleware, roleMiddleware("admin"), getPendingVerifications);
router.patch("/:id/approve", authMiddleware, roleMiddleware("admin"), approveVerification);
router.patch("/:id/reject", authMiddleware, roleMiddleware("admin"), rejectVerification);

export default router;
