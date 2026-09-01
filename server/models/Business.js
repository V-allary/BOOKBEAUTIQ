import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    // ==============================
    // BUSINESS OWNER
    // ==============================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==============================
    // BASIC BUSINESS INFORMATION
    // ==============================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: String,
      default: "Contact Business",
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    openingHours: {
      type: String,
      default: "9:00 AM - 6:00 PM",
    },

    instagramUrl: {
      type: String,
      default: "",
    },

    tiktokUrl: {
      type: String,
      default: "",
    },


    // ==============================
    // BUSINESS RATING & DISPLAY
    // ==============================

    rating: {
      type: Number,
      default: 5,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    // ==============================
    // PLATFORM LISTING STATUS
    // ==============================

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // ==============================
    // SERVICES
    // ==============================

    services: [
      {
        type: String,
      },
    ],

    // ==============================
    // GALLERY
    // ==============================

    gallery: [
      {
        type: String,
      },
    ],

        // ==============================
    // SUBSCRIPTION
    // ==============================

    subscriptionPlan: {
      type: String,
      enum: ["independent", "team"],
      default: "independent",
    },

    subscriptionStatus: {
      type: String,
      enum: ["trialing", "active", "past_due", "suspended"],
      default: "trialing",
    },

    trialEndsAt: {
      type: Date,
      default: null,
    },

    subscriptionPaidUntil: {
      type: Date,
      default: null,
    },

    gracePeriodEndsAt: {
      type: Date,
      default: null,
    },


    // ==============================
    // PAYOUTS (Paystack Subaccount)
    // ==============================

    paystackSubaccountCode: {
      type: String,
      default: "",
    },

    bankName: {
      type: String,
      default: "",
    },

    bankAccountNumber: {
      type: String,
      default: "",
    },

    bankAccountName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Business", businessSchema);
