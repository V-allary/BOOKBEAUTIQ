import express from "express";
import {
  getReviewByToken,
  submitReview,
  getBusinessReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/token/:token", getReviewByToken);
router.post("/token/:token", submitReview);
router.get("/business/:businessId", getBusinessReviews);

export default router;
