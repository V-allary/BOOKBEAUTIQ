import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },
    discountPrice: {
      type: Number,
      default: null,
    },

    discountLabel: {
      type: String,
      default: "",
    },

    discountStartDate: {
      type: Date,
      default: null,
    },

    discountEndDate: {
      type: Date,
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Service", serviceSchema);