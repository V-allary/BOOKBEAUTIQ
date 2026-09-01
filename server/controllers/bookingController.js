import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";


// Create booking — customer only
export const createBooking = async (req, res) => {
  try {
    const {
      businessId, service, staff, date, time,
      customerName, customerEmail, customerPhone,
      depositAmount,
    } = req.body;

    if (!businessId || !service || !staff || !date || !time || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ message: "Missing required booking details." });
    }

    const business = await Business.findById(businessId);
    if (!business || business.status !== "approved") {
      return res.status(404).json({ message: "Business not found." });
    }

    const booking = await Booking.create({
      customerId: req.user?.userId || null, // null for guest bookings
      businessId,
      service,
      staff,
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      depositAmount: depositAmount || 0,
      status: "Pending",
    });

    res.status(201).json({ message: "Booking created.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Logged-in customer's own bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.userId })
      .populate("businessId", "name location image")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Business owner viewing bookings for their business
export const getBusinessBookings = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can only view your own business's bookings." });
    }

    const bookings = await Booking.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel — customer can cancel their own booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only cancel your own bookings." });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Business marks a booking as completed — triggers the review email
export const markBookingCompleted = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const business = await Business.findById(booking.businessId);
    const isOwner = business?.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only manage your own business's bookings." });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ message: "This booking is already marked completed." });
    }

    const reviewToken = crypto.randomBytes(24).toString("hex");

    booking.status = "Completed";
    booking.reviewToken = reviewToken;
    await booking.save();

    const reviewUrl = `${process.env.CLIENT_URL}/review/${reviewToken}`;

    await sendEmail({
      to: booking.customerEmail,
      subject: `How was your visit to ${business.name}?`,
      html: `
        <p>Hi ${booking.customerName},</p>
        <p>Thanks for booking with ${business.name} on BookBeautiq. We'd love to hear how it went.</p>
        <p><a href="${reviewUrl}">Leave a review</a></p>
        <p>This link is unique to your booking and can only be used once.</p>
      `,
    });

    res.status(200).json({ message: "Booking marked completed. Review email sent.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};