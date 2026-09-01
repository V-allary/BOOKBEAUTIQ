import express from "express";
import { initializePayment, verifyPayment, paystackWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initialize", initializePayment);
router.get("/verify/:reference", verifyPayment);

// Webhook is mounted separately in server.js with raw body parsing —
// do NOT add it here.

export default router;
