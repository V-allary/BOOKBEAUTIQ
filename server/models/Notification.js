import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "booking_confirmed",
        "appointment_reminder",
        "payment_confirmation",
        "booking_cancelled",
        "booking_rescheduled",
        "new_message",
        "review_reminder",
        "new_booking",
        "booking_cancellation",
        "new_review",
        "payment_received",
        "business_approved",
        "business_rejected",
        "subscription_reminder",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    link: {
      type: String,
      default: "",
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
