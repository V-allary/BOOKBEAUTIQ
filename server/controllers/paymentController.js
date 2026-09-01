import crypto from "crypto";
import paystackRequest from "../utils/paystack.js";
import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";

// ==========================================
// INITIALIZE DEPOSIT PAYMENT
// Called right after a booking is created
// ==========================================

export const initializePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.depositPaid) {
      return res.status(400).json({ message: "This booking's deposit is already paid." });
    }

    const business = await Business.findById(booking.businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const payload = {
      email: booking.customerEmail,
      amount: Math.round(booking.depositAmount * 100), // Paystack expects amount in kobo/cents
      currency: "KES",
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      metadata: { bookingId: booking._id.toString() },
    };

    // Only split to the business's subaccount if they've linked one
    if (business.paystackSubaccountCode) {
      payload.subaccount = business.paystackSubaccountCode;
    }

    const transaction = await paystackRequest("/transaction/initialize", "POST", payload);

    booking.paystackReference = transaction.reference;
    await booking.save();

    res.status(200).json({
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// VERIFY PAYMENT (used by the frontend callback page)
// ==========================================

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const transaction = await paystackRequest(`/transaction/verify/${reference}`);

    if (transaction.status !== "success") {
      return res.status(400).json({ message: "Payment was not successful.", status: transaction.status });
    }

    const booking = await Booking.findOneAndUpdate(
      { paystackReference: reference },
      { depositPaid: true, status: "Confirmed" },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found for this payment." });

    res.status(200).json({ message: "Payment verified.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// PAYSTACK WEBHOOK
// Source of truth — confirms payment even if the
// customer closes the tab before the callback page loads
// ==========================================

export const paystackWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    const expectedSignature = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body) // raw buffer — see server.js middleware note
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(401).send("Invalid signature.");
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      await Booking.findOneAndUpdate(
        { paystackReference: reference },
        { depositPaid: true, status: "Confirmed" }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};
