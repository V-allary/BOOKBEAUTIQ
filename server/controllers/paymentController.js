import crypto from "crypto";
import paystackRequest from "../utils/paystack.js";
import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";
import notify from "../utils/notify.js";
import User from "../models/User.js";


// ==========================================
// INITIALIZE BOOKING + DEPOSIT PAYMENT
// ==========================================
export const initializeBookingPayment = async (req, res) => {
  try {
    const {
      businessId, service, staff, date, time,
      customerName, customerEmail, customerPhone,
      depositAmount, customerId,
    } = req.body;

    if (
      !businessId || !service || !date || !time ||
      !customerName || !customerEmail || !customerPhone || !depositAmount
    ) {
      return res.status(400).json({ message: "Missing required booking details." });
    }

    const business = await Business.findById(businessId);
    if (!business || business.status !== "approved") {
      return res.status(404).json({ message: "Business not found." });
    }

    if (!business.paystackSubaccountCode) {
      return res.status(400).json({
        message: "This business hasn't finished setting up payouts yet. Please try again later.",
      });
    }

    // ==========================================
    // PREVENT DOUBLE BOOKINGS
    // ==========================================

    const conflictFilter = {
      businessId,
      date,
      time,
      status: { $ne: "Cancelled" },
    };

    if (staff && staff !== "Not specified") {
      conflictFilter.staff = staff;
    }

    const conflict = await Booking.findOne(conflictFilter);

    if (conflict) {
      return res.status(409).json({
        message: "This professional is already booked at that date and time. Please choose another slot.",
      });
    }

    const priorBooking = await Booking.findOne({
      businessId,
      customerEmail,
      depositPaid: true,
    });
    const isFirstTimeDiscovery = !priorBooking;

    const COMMISSION_RATE = 0.20;
    const MIN_COMMISSION = 100;

    let commissionAmount = 0;

    const payload = {
      email: customerEmail,
      amount: Math.round(depositAmount * 100),
      currency: "KES",
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      metadata: {
        businessId,
        service,
        staff: staff || "Not specified",
        date,
        time,
        customerName,
        customerEmail,
        customerPhone,
        customerId: customerId || null,
        depositAmount,
        isFirstTimeDiscovery,
      },
    };

    if (isFirstTimeDiscovery) {
      const rawCommission = depositAmount * COMMISSION_RATE;
      commissionAmount = Math.max(rawCommission, MIN_COMMISSION);
      commissionAmount = Math.min(commissionAmount, depositAmount);

      const businessShare = depositAmount - commissionAmount;
      const businessSharePercent = Math.round((businessShare / depositAmount) * 100);

      payload.split = {
        type: "percentage",
        currency: "KES",
        subaccounts: [
          { subaccount: business.paystackSubaccountCode, share: businessSharePercent },
        ],
        bearer_type: "account",
      };
    } else {
      payload.subaccount = business.paystackSubaccountCode;
    }

    payload.metadata.commissionAmount = commissionAmount;

    const transaction = await paystackRequest("/transaction/initialize", "POST", payload);

    res.status(200).json({
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// CREATE THE REAL BOOKING FROM METADATA
// ==========================================

const createBookingFromMetadata = async (metadata, reference) => {
  const existing = await Booking.findOne({ paystackReference: reference });
  if (existing) return { booking: existing, isNew: false };

  const booking = await Booking.create({
    customerId: metadata.customerId || null,
    businessId: metadata.businessId,
    service: metadata.service,
    staff: metadata.staff,
    date: metadata.date,
    time: metadata.time,
    customerName: metadata.customerName,
    customerEmail: metadata.customerEmail,
    customerPhone: metadata.customerPhone,
    depositAmount: Number(metadata.depositAmount),
    depositPaid: true,
    status: "Confirmed",
    paystackReference: reference,
    isFirstTimeDiscovery:
      metadata.isFirstTimeDiscovery === true ||
      metadata.isFirstTimeDiscovery === "true",
    commissionAmount: Number(metadata.commissionAmount) || 0,
  });

  return { booking, isNew: true };
};

const sendBookingConfirmationNotifications = async (booking) => {
  const business = await Business.findById(booking.businessId);

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

    const { booking, isNew } = await createBookingFromMetadata(transaction.metadata, reference);

    if (isNew) {
      await sendBookingConfirmationNotifications(booking);
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

      const { booking, isNew } = await createBookingFromMetadata(event.data.metadata, reference);

      if (isNew) {
        await sendBookingConfirmationNotifications(booking);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};