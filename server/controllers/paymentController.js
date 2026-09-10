import crypto from "crypto";
import paystackRequest from "../utils/paystack.js";
import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";
import notify from "../utils/notify.js";
import User from "../models/User.js";


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

    if (!business.paystackSubaccountCode) {
      return res.status(400).json({
        message: "This business hasn't finished setting up payouts yet. Please try again later.",
      });
    }

  
    const priorBooking = await Booking.findOne({
      businessId: business._id,
      customerEmail: booking.customerEmail,
      depositPaid: true,
      _id: { $ne: booking._id },
    });

    const isFirstTimeDiscovery = !priorBooking;

    const COMMISSION_RATE = 0.20; 
    const MIN_COMMISSION = 100;  
    const payload = {
      email: booking.customerEmail,
      amount: Math.round(booking.depositAmount * 100),
      currency: "KES",
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      metadata: {
        bookingId: booking._id.toString(),
        isFirstTimeDiscovery,
      },
    };

    let commissionAmount = 0;

    if (isFirstTimeDiscovery) {
      const rawCommission = booking.depositAmount * COMMISSION_RATE;
      commissionAmount = Math.max(rawCommission, MIN_COMMISSION);

  
      commissionAmount = Math.min(commissionAmount, booking.depositAmount);

      const businessShare = booking.depositAmount - commissionAmount;
      const businessSharePercent = Math.round((businessShare / booking.depositAmount) * 100);

      payload.split = {
        type: "percentage",
        currency: "KES",
        subaccounts: [
          { subaccount: business.paystackSubaccountCode, share: businessSharePercent },
        ],
        bearer_type: "account",
      };
    } else {
      // Repeat customer for this business — no commission, 100% to them.
      payload.subaccount = business.paystackSubaccountCode;
    }

    const transaction = await paystackRequest("/transaction/initialize", "POST", payload);

    booking.paystackReference = transaction.reference;
    booking.isFirstTimeDiscovery = isFirstTimeDiscovery;
    booking.commissionAmount = commissionAmount;
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

    const business = await Business.findById(booking.businessId);

    // Notify customer
    await notify({
      userId: booking.customerId,
      type: "booking_confirmed",
      title: "Booking confirmed",
      message: `Your ${booking.service} appointment on ${booking.date} at ${booking.time} is confirmed.`,
      email: booking.customerEmail,
      link: "/dashboard",
      emailHtml: `
        <p>Hi ${booking.customerName},</p>
        <p>Your booking is confirmed:</p>
        <p>${booking.service} with ${booking.staff} on ${booking.date} at ${booking.time}</p>
        <p>Deposit paid: KES ${booking.depositAmount}</p>
      `,
    });

    // Notify business owner
    if (business) {
      const owner = await User.findById(business.owner);
      if (owner) {
        const commissionNote = booking.isFirstTimeDiscovery
          ? ` This was a new customer discovered through BookBeautiq, so a one-time commission of KES ${booking.commissionAmount} was applied — you received KES ${(booking.depositAmount - booking.commissionAmount).toFixed(0)}.`
          : "";

        await notify({
          userId: owner._id,
          type: "payment_received",
          title: "Payment received",
          message: `You received a deposit from ${booking.customerName}.${commissionNote}`,
          email: owner.email,
          link: "/dashboard",
          emailHtml: `
            <p>Hi ${owner.firstName},</p>
            <p>You received a KES ${booking.depositAmount} deposit from ${booking.customerName}.</p>
            ${
              booking.isFirstTimeDiscovery
                ? `<p><strong>Note:</strong> ${booking.customerName} is a new customer discovered through BookBeautiq. A one-time commission of KES ${booking.commissionAmount} was applied to this transaction only — you received KES ${(booking.depositAmount - booking.commissionAmount).toFixed(0)} directly to your account.</p>`
                : `<p>No commission applies — you've already welcomed this customer before, so you received the full deposit.</p>`
            }
          `,
        });
      }
    }

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
