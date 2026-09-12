import paystackRequest from "../utils/paystack.js";
import Business from "../models/Business.js";

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

// Verify subscription payment and reactivate the business
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const transaction = await paystackRequest(`/transaction/verify/${reference}`);

    if (transaction.status !== "success") {
      return res.status(400).json({ message: "Payment was not successful.", status: transaction.status });
    }

    const businessId = transaction.metadata?.businessId;
    const wantsAutoRenew = transaction.metadata?.autoRenew === true || transaction.metadata?.autoRenew === "true";

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Business not found for this payment." });

    const paidUntil = new Date();
    paidUntil.setDate(paidUntil.getDate() + 30);

    business.subscriptionStatus = "active";
    business.subscriptionPaidUntil = paidUntil;
    business.gracePeriodEndsAt = null;
    business.lastReminderSentAt = null;

    const auth = transaction.authorization;
    if (auth?.reusable && auth?.authorization_code) {
      business.paystackAuthorizationCode = auth.authorization_code;
      business.paystackCardLast4 = auth.last4 || "";
      business.paystackCardBrand = auth.brand || "";
      business.autoRenew = wantsAutoRenew; // only true if they explicitly opted in
    } else {
      business.autoRenew = false;
    }

    await business.save();

    res.status(200).json({ message: "Subscription payment verified.", business });
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
