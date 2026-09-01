import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest bookings
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
    },

    customerPhone: {
      type: String,
      required: true,
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    service: {
      type: String,
      required: true,
    },
    staff: {
      type: String,
      default: "Not specified",
    },


    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },

    // ==============================
    // PAYMENT
    // ==============================

    depositAmount: {
      type: Number,
      default: 0,
    },

    depositPaid: {
      type: Boolean,
      default: false,
    },

    paystackReference: {
      type: String,
      default: "",
    },

    // ==============================
    // REVIEW
    // ==============================

    reviewToken: {
      type: String,
      default: "",
    },

    reviewSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
