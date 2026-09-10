import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  initializeSubscriptionPayment,
  verifySubscriptionPayment,
  toggleAutoRenew,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.post(
  "/:businessId/initialize",
  authMiddleware,
  roleMiddleware("business", "admin"),
  initializeSubscriptionPayment
);

router.get("/verify/:reference", verifySubscriptionPayment);

router.patch(
  "/:businessId/auto-renew",
  authMiddleware,
  roleMiddleware("business", "admin"),
  toggleAutoRenew
);

export default router;
