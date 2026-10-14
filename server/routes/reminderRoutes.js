import express from "express";
import crypto from "crypto";
import runBookingReminders from "../jobs/bookingReminders.js";

const router = express.Router();

const secretOk = (provided) => {
  const expected = process.env.INTERNAL_JOB_SECRET || "";
  if (!expected || typeof provided !== "string") return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

router.post("/booking-reminders", async (req, res) => {
  if (!secretOk(req.headers["x-internal-secret"])) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const summary = await runBookingReminders({ dryRun: req.query.dryRun === "1" });
    res.status(200).json(summary);
  } catch (error) {
    console.error("Booking reminders failed:", error);
    res.status(500).json({ message: "Booking reminders failed." });
  }
});

export default router;