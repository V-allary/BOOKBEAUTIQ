import express from "express";
import rateLimit from "express-rate-limit";
import { getReportContext, submitReport } from "../controllers/reportController.js";

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many reports from this connection. Please try again later." },
});

const contextLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

// Public: the private link in the booking email is the credential
router.get("/context/:token", contextLimiter, getReportContext);
router.post("/", submitLimiter, submitReport);

export default router;