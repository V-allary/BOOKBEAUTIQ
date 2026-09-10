import Review from "../models/Review.js";
import Booking from "../models/Bookings.js";
import notify from "../utils/notify.js";
import Business from "../models/Business.js";
import User from "../models/User.js";


// Look up a booking by its review token (public, no auth)
export const getReviewByToken = async (req, res) => {
  try {
    const booking = await Booking.findOne({ reviewToken: req.params.token });

    if (!booking) return res.status(404).json({ message: "This review link is invalid." });
    if (booking.reviewSubmitted) return res.status(400).json({ message: "A review has already been submitted for this booking." });

    res.status(200).json({
      businessId: booking.businessId,
      service: booking.service,
      customerName: booking.customerName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit a review via the token (public, no auth)
export const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findOne({ reviewToken: req.params.token });

    if (!booking) return res.status(404).json({ message: "This review link is invalid." });
    if (booking.reviewSubmitted) return res.status(400).json({ message: "A review has already been submitted for this booking." });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "A rating between 1 and 5 is required." });
    }

    const review = await Review.create({
      businessId: booking.businessId,
      bookingId: booking._id,
      customerName: booking.customerName,
      rating,
      comment: comment || "",
    });

    booking.reviewSubmitted = true;
    await booking.save();

    const business = await Business.findById(booking.businessId);
    if (business) {
      const owner = await User.findById(business.owner);
      if (owner) {
        await notify({
          userId: owner._id,
          type: "new_review",
          title: "New review received",
          message: `${booking.customerName} left a ${rating}-star review.`,
          email: owner.email,
          link: "/dashboard",
        });
      }
    }


    res.status(201).json({ message: "Thank you for your review!", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const businessReviews = await Review.find({ businessId: booking.businessId });
const avgRating =
  businessReviews.reduce((sum, r) => sum + r.rating, 0) / businessReviews.length;

await Business.findByIdAndUpdate(booking.businessId, {
  avgRating,
  reviewCount: businessReviews.length,
});

// Public — all reviews for a business
export const getBusinessReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
