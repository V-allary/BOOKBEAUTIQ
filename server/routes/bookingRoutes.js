import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import optionalAuth from "../middleware/optionalAuth.js";
import {
  createBooking,
  getMyBookings,
  getBusinessBookings,
  cancelBooking,
  markBookingCompleted,
} from "../controllers/bookingController.js";

const router = express.Router();

// ==========================================
// CREATE BOOKING
// Guest-friendly — no login required.
// If a logged-in customer sends a valid token,
// optionalAuth decodes it so the booking links
// to their account. Guests pass through fine.
// ==========================================

router.post("/", optionalAuth, createBooking);

// ==========================================
// CUSTOMER — MY BOOKINGS
// ==========================================

router.get("/my-bookings", authMiddleware, getMyBookings);

// ==========================================
// BUSINESS OWNER — BOOKINGS FOR THEIR BUSINESS
// ==========================================

router.get(
  "/business/:businessId",
  authMiddleware,
  roleMiddleware("business", "admin"),
  getBusinessBookings
);

// ==========================================
// CUSTOMER — CANCEL THEIR OWN BOOKING
// ==========================================

router.patch("/:id/cancel", authMiddleware, cancelBooking);

// ==========================================
// BUSINESS OWNER — MARK BOOKING COMPLETED
// Triggers the review email
// ==========================================

router.patch(
  "/:id/complete",
  authMiddleware,
  roleMiddleware("business", "admin"),
  markBookingCompleted
);

export default router;
