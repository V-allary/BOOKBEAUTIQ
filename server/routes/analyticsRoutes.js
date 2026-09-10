import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { getBusinessAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get(
  "/:businessId",
  authMiddleware,
  roleMiddleware("business", "admin"),
  getBusinessAnalytics
);

export default router;
