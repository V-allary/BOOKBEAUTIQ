import mongoose from "mongoose";
import PlatformReview from "../models/PlatformReview.js";
import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";
import User from "../models/User.js";

const getUserId = (req) => req.user?.userId || req.user?.id || req.user?._id;

// ==========================================
// CUSTOMER / BUSINESS OWNER — check eligibility + existing review
// ==========================================

export const getMyPlatformReviewStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId).select("firstName lastName role");
    if (!user) return res.status(404).json({ message: "User not found." });

    const existing = await PlatformReview.findOne({ userId }).select("status rating comment");

    let eligible = false;
    if (user.role === "customer") {
      eligible = await Booking.exists({
        customerId: userId,
        depositPaid: true,
        status: { $in: ["Confirmed", "Completed"] },
      });
    } else if (user.role === "business") {
      eligible = await Business.exists({ owner: userId, status: "approved" });
    }

    res.status(200).json({
      eligible: !!eligible,
      existing: existing || null,
    });
  } catch (error) {
    console.error("Get review status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SUBMIT — customer or business owner
// ==========================================

export const submitPlatformReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Please choose a rating from 1 to 5." });
    }
    if (comment.length < 10) {
      return res.status(400).json({ message: "Please write at least 10 characters." });
    }
    if (comment.length > 500) {
      return res.status(400).json({ message: "Please keep your review under 500 characters." });
    }

    if (await PlatformReview.exists({ userId })) {
      return res.status(409).json({ message: "You've already submitted a review." });
    }

    const user = await User.findById(userId).select("firstName lastName role");
    if (!user) return res.status(404).json({ message: "User not found." });

    let eligible = false;
    if (user.role === "customer") {
      eligible = await Booking.exists({
        customerId: userId,
        depositPaid: true,
        status: { $in: ["Confirmed", "Completed"] },
      });
    } else if (user.role === "business") {
      eligible = await Business.exists({ owner: userId, status: "approved" });
    }

    if (!eligible) {
      return res.status(403).json({
        message:
          user.role === "customer"
            ? "You can leave a review once you've completed a booking."
            : "You can leave a review once your business is approved.",
      });
    }

    const displayName = `${user.firstName} ${user.lastName?.charAt(0) || ""}.`.trim();

    try {
      await PlatformReview.create({
        userId,
        displayName,
        role: user.role,
        rating,
        comment,
      });
    } catch (createError) {
      if (createError.code === 11000) {
        return res.status(409).json({ message: "You've already submitted a review." });
      }
      throw createError;
    }

    res.status(201).json({ message: "Thanks! Your review will appear once it's been reviewed by our team." });
  } catch (error) {
    console.error("Submit platform review error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// PUBLIC — approved reviews only
// ==========================================

export const getPublicPlatformReviews = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 24);

    const reviews = await PlatformReview.find({ status: "approved" })
      .sort({ reviewedAt: -1 })
      .limit(limit)
      .select("displayName role rating comment reviewedAt")
      .lean();

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Get public platform reviews error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ADMIN — list
// ==========================================

export const listPlatformReviews = async (req, res) => {
  try {
    const status = ["pending", "approved", "rejected"].includes(req.query.status)
      ? req.query.status
      : "pending";

    const reviews = await PlatformReview.find({ status })
      .sort({ createdAt: status === "pending" ? 1 : -1 })
      .populate("userId", "email");

    const counts = await PlatformReview.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const countMap = { pending: 0, approved: 0, rejected: 0 };
    counts.forEach((row) => {
      countMap[row._id] = row.count;
    });

    res.status(200).json({ reviews, counts: countMap });
  } catch (error) {
    console.error("List platform reviews error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ADMIN — approve / reject
// ==========================================

export const updatePlatformReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body?.status;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid review ID." });
    }
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected." });
    }

    const review = await PlatformReview.findOneAndUpdate(
      { _id: id, status: "pending" },
      {
        $set: {
          status,
          reviewedAt: new Date(),
          reviewedBy: getUserId(req),
        },
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found, or already reviewed." });
    }

    res.status(200).json({ message: `Review ${status}.`, review });
  } catch (error) {
    console.error("Update platform review error:", error);
    res.status(500).json({ message: error.message });
  }
};