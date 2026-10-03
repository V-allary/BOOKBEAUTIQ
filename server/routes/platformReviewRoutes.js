import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getMyPlatformReviewStatus,
  submitPlatformReview,
  getPublicPlatformReviews,
} from "../controllers/platformReviewController.js";

const router = express.Router();

// Public
router.get("/public", getPublicPlatformReviews);

// Logged-in customer or business owner
router.get("/me", authMiddleware, getMyPlatformReviewStatus);
router.post("/", authMiddleware, submitPlatformReview);

export default router;