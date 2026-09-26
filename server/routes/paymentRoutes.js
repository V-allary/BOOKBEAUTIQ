import express from "express";
import { initializeBookingPayment, verifyPayment, paystackWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initialize-booking", initializeBookingPayment);
router.get("/verify/:reference", verifyPayment);

// Webhook is mounted separately in server.js with raw body parsing —
// do NOT add it here.

export default router;