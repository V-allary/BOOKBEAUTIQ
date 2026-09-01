import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    // The customer side of the conversation.
    // For guest bookings this may be null — customerEmail identifies them instead.
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ["customer", "business"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
