import paystackRequest from "../utils/paystack.js";
import Business from "../models/Business.js";
import mongoose from "mongoose";
import { applyBankedFreeDays, awardReferralForPayment } from "../utils/referrals.js";


const PLAN_PRICES = {
  independent: 1500,
  team: 2500,
};

// Initialize a subscription payment (manual, no saved card)
export const initializeSubscriptionPayment = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only manage your own business's subscription." });
    }

    const amount = PLAN_PRICES[business.subscriptionPlan] || PLAN_PRICES.independent;
    const wantsAutoRenew = req.body?.autoRenew === true;

    const transaction = await paystackRequest("/transaction/initialize", "POST", {
      email: business.email || req.user.email,
      amount: amount * 100,
      currency: "KES",
      channels: ["card", "mobile_money", "bank"], // guarantees M-Pesa/Airtel Money show as options
      callback_url: `${process.env.CLIENT_URL}/subscription/callback`,
      metadata: {
        businessId: business._id.toString(),
        type: "subscription",
        autoRenew: wantsAutoRenew,
      },
    });

    res.status(200).json({
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Shared by the callback page and the Paystack webhook, so a subscription
// activates even if the owner closes the tab. Safe to run twice for the same
// payment: the update only applies if this reference hasn't been used yet.
export const activateSubscriptionFromTransaction = async (transaction, reference) => {
  const metadata = transaction?.metadata || {};

  if (transaction?.status !== "success" || metadata.type !== "subscription") {
    return { ok: false, message: "This isn't a subscription payment." };
  }

  if (!mongoose.isValidObjectId(metadata.businessId)) {
    return { ok: false, message: "Business not found for this payment." };
  }

  const business = await Business.findById(metadata.businessId);
  if (!business) {
    return { ok: false, message: "Business not found for this payment." };
  }

  const expectedAmount =
    (PLAN_PRICES[business.subscriptionPlan] || PLAN_PRICES.independent) * 100;

  if (transaction.currency !== "KES" || Number(transaction.amount) < expectedAmount) {
    return { ok: false, message: "The amount paid doesn't match the subscription price." };
  }

  const wantsAutoRenew =
    metadata.autoRenew === true || metadata.autoRenew === "true";

  const paidUntil = new Date();
  paidUntil.setDate(paidUntil.getDate() + 30);

  const set = {
    subscriptionStatus: "active",
    subscriptionPaidUntil: paidUntil,
    gracePeriodEndsAt: null,
    lastReminderSentAt: null,
    lastSubscriptionReference: reference,
  };

  const auth = transaction.authorization;
  if (auth?.reusable && auth?.authorization_code) {
    set.paystackAuthorizationCode = auth.authorization_code;
    set.paystackCardLast4 = auth.last4 || "";
    set.paystackCardBrand = auth.brand || "";
    set.autoRenew = wantsAutoRenew; // only true if they explicitly opted in
  } else {
    set.autoRenew = false;
  }

  const updated = await Business.findOneAndUpdate(
    { _id: business._id, lastSubscriptionReference: { $ne: reference } },
    { $set: set },
    { new: true }
  );

  // Already applied (callback and webhook both ran, or a replay).
  if (!updated) return { ok: true, business, alreadyProcessed: true };

  // Referral steps must never make a paid subscription look failed.
  try {
    await applyBankedFreeDays(updated);
    await awardReferralForPayment(updated);
  } catch (referralError) {
    console.error("Referral processing failed:", referralError.message);
  }

  return { ok: true, business: updated };
};


// Verify subscription payment and reactivate the business
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const transaction = await paystackRequest(`/transaction/verify/${reference}`);

    if (transaction.status !== "success") {
      return res.status(400).json({ message: "Payment was not successful.", status: transaction.status });
    }

    const result = await activateSubscriptionFromTransaction(transaction, reference);

    if (!result.ok) {
      return res.status(400).json({ message: result.message });
    }

    // Only what the callback page needs. This route is public, so it must
    // not return the whole business record.
    res.status(200).json({
      message: "Subscription payment verified.",
      subscriptionStatus: result.business.subscriptionStatus,
      subscriptionPaidUntil: result.business.subscriptionPaidUntil,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleAutoRenew = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only manage your own business's subscription." });
    }

    if (!business.paystackAuthorizationCode) {
      return res.status(400).json({ message: "No saved card on file. Pay once with auto-renew checked to enable this." });
    }

    business.autoRenew = req.body.autoRenew === true;
    await business.save();

    res.status(200).json({
      message: business.autoRenew ? "Auto-renew turned on." : "Auto-renew turned off.",
      business,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clears the saved payment method. The next payment will
// prompt for a fresh card or mobile money option — this is
// meant to be called immediately before opening a new checkout,
// not as a standalone "delete and leave empty" action.
export const removePaymentMethod = async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only manage your own business's subscription." });
    }

    business.paystackAuthorizationCode = "";
    business.paystackCardLast4 = "";
    business.paystackCardBrand = "";
    business.autoRenew = false;
    await business.save();

    res.status(200).json({
      message: "Payment method removed.",
      business,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
