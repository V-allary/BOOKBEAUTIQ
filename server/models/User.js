import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },


    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "business", "admin"],
      default: "customer",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    accountStatus: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
    savedBusinesses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
      },
    ],


        // ==============================
    // IDENTITY + BUSINESS VERIFICATION
    // ==============================

    identityDocumentType: {
      type: String,
      enum: ["passport", "national_id", "drivers_license", null],
      default: null,
    },
    identityDocument: {
      type: String,
      default: "",
    },
    legalBusinessName: {
      type: String,
      default: "",
      trim: true,
    },
    businessRegistrationNumber: {
      type: String,
      default: "",
      trim: true,
    },
    businessAddress: {
      type: String,
      default: "",
      trim: true,
    },
    countryOfRegistration: {
      type: String,
      default: "",
      trim: true,
    },
    businessDocument: {
      type: String,
      default: "",
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "under_review", "verified", "rejected"],
      default: "unverified",
    },
    verificationSubmittedAt: {
      type: Date,
      default: null,
    },
    verificationReviewedAt: {
      type: Date,
      default: null,
    },
    verificationNotes: {
      type: String,
      default: "",
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // ==============================
    // EMAIL VERIFICATION (OTP)
    // ==============================

    emailVerificationCode: {
      type: String, // HMAC of the code, never the code itself
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    emailVerificationAttempts: {
      type: Number,
      default: 0,
    },
    emailVerificationLastSentAt: {
      type: Date,
      default: null,
    },
    emailVerificationSendCount: {
      type: Number,
      default: 0,
    },
    emailVerificationWindowStart: {
      type: Date,
      default: null,
    },



  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.emailVerificationCode;
  delete user.emailVerificationExpires;
  delete user.emailVerificationAttempts;
  delete user.emailVerificationLastSentAt;
  delete user.emailVerificationSendCount;
  delete user.emailVerificationWindowStart;
  return user;
};


export default mongoose.model("User", userSchema);