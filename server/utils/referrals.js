import crypto from "crypto";
import User from "../models/User.js";
import Business from "../models/Business.js";
import Referral from "../models/Referral.js";
import notify from "./notify.js";
import escapeHtml from "./escapeHtml.js";

export const FREE_DAYS = 30;
export const YEARLY_CAP = 6;

const DAY_MS = 24 * 60 * 60 * 1000;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

const makeCode = () =>
  Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join("");

const phoneKey = (p) => String(p || "").replace(/\D/g, "").slice(-9);

// Owners get a code the first time they open their referral card,
// so existing accounts need no migration.
export const ensureReferralCode = async (userId) => {
  const current = await User.findById(userId).select("referralCode");
  if (current?.referralCode) return current.referralCode;

  for (let i = 0; i < 5; i++) {
    try {
      const updated = await User.findOneAndUpdate(
        { _id: userId, referralCode: { $exists: false } },
        { $set: { referralCode: makeCode() } },
        { new: true }
      );
      if (updated?.referralCode) return updated.referralCode;

      const again = await User.findById(userId).select("referralCode");
      if (again?.referralCode) return again.referralCode;
    } catch (error) {
      if (error.code !== 11000) throw error; // 11000 = code collision, try again
    }
  }
  throw new Error("Could not create a referral code.");
};

// Called at sign-up. Never throws into the sign-up flow (the caller catches).
export const linkReferral = async (newUser, rawCode) => {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) return;

  const referrer = await User.findOne({ referralCode: code, role: "business" }).select(
    "_id phone accountStatus"
  );
  if (!referrer || String(referrer._id) === String(newUser._id)) return;
  if (referrer.accountStatus === "suspended") return;

  // Same phone number = almost certainly the same person.
  const a = phoneKey(referrer.phone);
  const b = phoneKey(newUser.phone);
  if (a.length === 9 && a === b) return;

  await Referral.create({ referrerId: referrer._id, referredUserId: newUser._id });
  await User.updateOne({ _id: newUser._id }, { $set: { referredBy: referrer._id } });
};

// Called right after a business's subscription payment is confirmed.
// The atomic claim means a payment processed twice rewards only once.
export const awardReferralForPayment = async (business) => {
  const referral = await Referral.findOneAndUpdate(
    { referredUserId: business.owner, status: "signed_up" },
    { $set: { status: "rewarded", rewardedAt: new Date() } },
    { new: true }
  );
  if (!referral) return null;

  const giveBack = (status) =>
    Referral.updateOne({ _id: referral._id }, { $set: { status, rewardedAt: null } });

  const referrerBusiness = await Business.findOne({ owner: referral.referrerId });
  if (!referrerBusiness) {
    await giveBack("signed_up"); // try again at a later payment
    return null;
  }

  // Same payout account on both businesses = likely the same person.
  const sameAccount =
    business.bankAccountName &&
    referrerBusiness.bankAccountName &&
    business.bankAccountNumber &&
    business.bankAccountName.trim().toLowerCase() ===
      referrerBusiness.bankAccountName.trim().toLowerCase() &&
    business.bankAccountNumber === referrerBusiness.bankAccountNumber; // stored masked
  if (sameAccount) {
    await giveBack("blocked");
    return null;
  }

  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);
  const earnedThisYear = await Referral.countDocuments({
    referrerId: referral.referrerId,
    status: "rewarded",
    rewardedAt: { $gte: since },
    _id: { $ne: referral._id },
  });
  if (earnedThisYear >= YEARLY_CAP) {
    await giveBack("capped");
    return null;
  }

  const now = Date.now();
  const extend = (date) =>
    new Date(Math.max(date ? new Date(date).getTime() : 0, now) + FREE_DAYS * DAY_MS);

  let banked = false;
  if (referrerBusiness.subscriptionStatus === "trialing") {
    referrerBusiness.trialEndsAt = extend(referrerBusiness.trialEndsAt);
  } else if (referrerBusiness.subscriptionStatus === "active") {
    // Also pushes back the next auto-charge, so they aren't billed for that month.
    referrerBusiness.subscriptionPaidUntil = extend(referrerBusiness.subscriptionPaidUntil);
  } else {
    // past_due / suspended: hold it until they next pay.
    referrerBusiness.bankedFreeDays = (referrerBusiness.bankedFreeDays || 0) + FREE_DAYS;
    banked = true;
  }
  await referrerBusiness.save();

  const referrer = await User.findById(referral.referrerId).select("firstName email");
  if (referrer) {
    await notify({
      userId: referrer._id,
      type: "referral_reward",
      title: "You earned a free month!",
      message: banked
        ? `${business.name} subscribed through your link. Your free month will start when you next subscribe.`
        : `${business.name} subscribed through your link. We added 30 free days to your subscription.`,
      email: referrer.email,
      link: "/dashboard",
      emailHtml: `
        <p>Hi ${escapeHtml(referrer.firstName)},</p>
        <p><strong>${escapeHtml(business.name)}</strong> just subscribed to BookBeautiq using your referral link.</p>
        <p>${
          banked
            ? "Your free month is saved and will start the next time you subscribe."
            : "We've added 30 free days to your subscription. Thank you for spreading the word!"
        }</p>
        <p><a href="${process.env.CLIENT_URL}/dashboard">Open your dashboard</a></p>
      `,
    });
  }

  return referral;
};

// Applies free days that were waiting while the business was past_due/suspended.
// Call after a payment has set the business to "active".
export const applyBankedFreeDays = async (business) => {
  const days = business.bankedFreeDays || 0;
  if (days <= 0 || business.subscriptionStatus !== "active" || !business.subscriptionPaidUntil) {
    return;
  }
  business.subscriptionPaidUntil = new Date(
    new Date(business.subscriptionPaidUntil).getTime() + days * DAY_MS
  );
  business.bankedFreeDays = 0;
  await business.save();
};

export const getReferralStats = async (userId) => {
  const referrals = await Referral.find({ referrerId: userId })
    .select("status rewardedAt")
    .lean();

  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const rewarded = referrals.filter((r) => r.status === "rewarded");
  const rewardedThisYear = rewarded.filter(
    (r) => r.rewardedAt && new Date(r.rewardedAt) >= since
  ).length;

  const business = await Business.findOne({ owner: userId }).select("bankedFreeDays");

  return {
    signedUp: referrals.length,
    rewarded: rewarded.length,
    yearlyCap: YEARLY_CAP,
    remainingThisYear: Math.max(0, YEARLY_CAP - rewardedThisYear),
    bankedDays: business?.bankedFreeDays || 0,
  };
};