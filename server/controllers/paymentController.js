import crypto from "crypto";
import paystackRequest from "../utils/paystack.js";
import Booking from "../models/Bookings.js";
import Business from "../models/Business.js";
import notify from "../utils/notify.js";
import User from "../models/User.js";
import escapeHtml from "../utils/escapeHtml.js";
import Service from "../models/Service.js";
import mongoose from "mongoose";


// ==========================================
// INITIALIZE BOOKING + DEPOSIT PAYMENT
// No Booking record exists yet. Everything travels
// through Paystack's metadata until payment succeeds.
// ==========================================
export const initializeBookingPayment = async (req, res) => {
  try {
    const {
      businessId, serviceId, staff, date, time,
      customerName, customerEmail, customerPhone,
    } = req.body;

    // From the login token (via optionalAuth), never from the request body
    const customerId = req.user?.userId || null;

    if (
      !businessId || !serviceId || !date || !time ||
      !customerName || !customerEmail || !customerPhone
    ) {
      return res.status(400).json({ message: "Missing required booking details." });
    }

    if (!mongoose.isValidObjectId(serviceId)) {
      return res.status(400).json({ message: "Invalid service." });
    }

    // ==========================================
    // PRICE COMES FROM THE DATABASE, NEVER THE BROWSER
    // Mirrors the same active-discount check Checkout.jsx uses
    // for display, so the price shown always matches what's charged.
    // ==========================================

    const serviceDoc = await Service.findOne({
      _id: serviceId,
      businessId,
      active: true,
    });

    if (!serviceDoc) {
      return res.status(404).json({ message: "This service is no longer available." });
    }

    const now = new Date();
    const discountActive =
      serviceDoc.discountPrice != null &&
      (!serviceDoc.discountStartDate || serviceDoc.discountStartDate <= now) &&
      (!serviceDoc.discountEndDate || serviceDoc.discountEndDate >= now);

    const effectivePrice = discountActive ? serviceDoc.discountPrice : serviceDoc.price;
    const depositAmount = Math.round(effectivePrice * 0.3);
    const service = serviceDoc.name;

    // ==========================================
    // BLOCK SUSPENDED CUSTOMERS
    // Covers logged-in customers and guest checkout by email
    // ==========================================

    const blockedAccount = await User.findOne({
      accountStatus: "suspended",
      $or: [
        { email: String(customerEmail).trim().toLowerCase() },
        ...(customerId ? [{ _id: customerId }] : []),
      ],
    }).select("_id");

    if (blockedAccount) {
      return res.status(403).json({
        code: "ACCOUNT_SUSPENDED",
        message: "This account can't make bookings right now. Please contact BookBeautiq support.",
      });
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
    // Only real, non-cancelled bookings count as conflicts.
    // Abandoned checkouts never create a record at all.
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

    // ==========================================
    // COMMISSION — first booking with this business only
    // ==========================================

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
        customerId,
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
      // Repeat customer for this business — no commission, 100% to them.
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
// Called only after Paystack confirms success. Shared by
// verifyPayment and the webhook, with a guard so processing
// the same payment twice can't create two bookings.
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
    reportToken: crypto.randomBytes(24).toString("hex"),
    isFirstTimeDiscovery:
      metadata.isFirstTimeDiscovery === true ||
      metadata.isFirstTimeDiscovery === "true",
    commissionAmount: Number(metadata.commissionAmount) || 0,
  });

  return { booking, isNew: true };
};


// ==========================================
// NOTIFICATIONS AFTER A SUCCESSFUL BOOKING
// Customer: booking confirmation
// Business owner: payment received + new booking details
// ==========================================

const sendBookingConfirmationNotifications = async (booking) => {
  const business = await Business.findById(booking.businessId);

  const customerName = escapeHtml(booking.customerName);
  const service = escapeHtml(booking.service);
  const staff = escapeHtml(booking.staff);
  const date = escapeHtml(booking.date);
  const time = escapeHtml(booking.time);

  // ---------- Customer ----------

  await notify({
    userId: booking.customerId,
    type: "booking_confirmed",
    title: "Booking confirmed",
    message: `Your ${booking.service} appointment on ${booking.date} at ${booking.time} is confirmed.`,
    email: booking.customerEmail,
    link: "/dashboard",
    emailHtml: `
      <p>Hi ${customerName},</p>
      <p>Your booking is confirmed:</p>
      <p>${service} with ${staff} on ${date} at ${time}</p>
     <p>Deposit paid: KES ${booking.depositAmount}</p>
      <p style="margin-top:24px;font-size:13px;color:#777;">
        Something went wrong with your appointment?
        <a href="${process.env.CLIENT_URL}/report/${booking.reportToken}">Report a problem</a>
      </p>
    `,
  });

  if (!business) return;

  const owner = await User.findById(business.owner);
  if (!owner) return;

  // ---------- Business owner: payment received ----------

  const ownerShare = (booking.depositAmount - booking.commissionAmount).toFixed(0);

  const commissionNote = booking.isFirstTimeDiscovery
    ? ` This was a new customer discovered through BookBeautiq, so a one-time commission of KES ${booking.commissionAmount} was applied — you received KES ${ownerShare}.`
    : "";

  await notify({
    userId: owner._id,
    type: "payment_received",
    title: "Payment received",
    message: `You received a deposit from ${booking.customerName}.${commissionNote}`,
    email: owner.email,
    link: "/dashboard",
    emailHtml: `
      <p>Hi ${escapeHtml(owner.firstName)},</p>
      <p>You received a KES ${booking.depositAmount} deposit from ${customerName}.</p>
      ${
        booking.isFirstTimeDiscovery
          ? `<p><strong>Note:</strong> ${customerName} is a new customer discovered through BookBeautiq. A one-time commission of KES ${booking.commissionAmount} was applied to this transaction only — you received KES ${ownerShare} directly to your account.</p>`
          : `<p>No commission applies — you've already welcomed this customer before, so you received the full deposit.</p>`
      }
    `,
  });

  // ---------- Business owner: new booking details ----------

  await notify({
    userId: owner._id,
    type: "new_booking",
    title: "New booking received",
    message: `${booking.customerName} booked ${booking.service} for ${booking.date} at ${booking.time}.`,
    email: owner.email,
    link: "/dashboard",
    emailHtml: `
      <p>Hi ${escapeHtml(owner.firstName)},</p>
      <p>You have a new booking for <strong>${escapeHtml(business.name)}</strong>:</p>
      <p><strong>Service:</strong> ${service}</p>
      ${
        booking.staff && booking.staff !== "Not specified"
          ? `<p><strong>Professional:</strong> ${staff}</p>`
          : ""
      }
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Customer Phone:</strong> ${escapeHtml(booking.customerPhone)}</p>
      <p><strong>Customer Email:</strong> ${escapeHtml(booking.customerEmail)}</p>
      <p><a href="${process.env.CLIENT_URL}/dashboard">View in your dashboard</a></p>
    `,
  });
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
      .update(req.body) // raw buffer — mounted with express.raw() in server.js
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