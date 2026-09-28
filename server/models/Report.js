import mongoose from "mongoose";

// Single source of truth for report reasons. Keys are stored in the
// database; labels are what people see (form, admin inbox, emails).
export const REPORT_CATEGORIES = {
  business_did_not_attend: "The business didn't attend to me or turned me away",
  poor_service: "Poor quality of service",
  rude_or_unprofessional: "Rude or unprofessional behaviour",
  hygiene_or_safety: "Hygiene or safety concerns",
  overcharged: "Charged more than agreed",
  listing_not_accurate: "The listing wasn't accurate",
  marked_no_show_unfairly: "I was marked as a no-show but I attended",
  other: "Something else",
};

const reportSchema = new mongoose.Schema(
  {
    // unique: one report per booking
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    category: {
      type: String,
      enum: Object.keys(REPORT_CATEGORIES),
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["open", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    adminNote: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);