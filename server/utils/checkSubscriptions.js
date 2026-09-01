import Business from "../models/Business.js";
import sendEmail from "./sendEmail.js";

const GRACE_DAYS = 3;

const checkSubscriptions = async () => {
  const now = new Date();

  // 1. Trials that just ended — move to past_due, start grace period, email them
  const endingTrials = await Business.find({
    subscriptionStatus: "trialing",
    trialEndsAt: { $lte: now },
  }).populate("owner", "email firstName");

  for (const business of endingTrials) {
    const graceEnd = new Date();
    graceEnd.setDate(graceEnd.getDate() + GRACE_DAYS);

    business.subscriptionStatus = "past_due";
    business.gracePeriodEndsAt = graceEnd;
    await business.save();

    if (business.owner?.email) {
      await sendEmail({
        to: business.owner.email,
        subject: "Your BookBeautiq free trial has ended",
        html: `
          <p>Hi ${business.owner.firstName || "there"},</p>
          <p>Your 7-day free trial for <strong>${business.name}</strong> has ended.</p>
          <p>Please pay your subscription within ${GRACE_DAYS} days to keep your business visible on BookBeautiq.</p>
          <p><a href="${process.env.CLIENT_URL}/dashboard">Pay now from your dashboard</a></p>
        `,
      });
    }
  }

  // 2. Grace period expired without payment — suspend
  const overdue = await Business.find({
    subscriptionStatus: "past_due",
    gracePeriodEndsAt: { $lte: now },
  }).populate("owner", "email firstName");

  for (const business of overdue) {
    business.subscriptionStatus = "suspended";
    await business.save();

    if (business.owner?.email) {
      await sendEmail({
        to: business.owner.email,
        subject: "Your BookBeautiq business has been suspended",
        html: `
          <p>Hi ${business.owner.firstName || "there"},</p>
          <p><strong>${business.name}</strong> is now suspended due to an unpaid subscription and is no longer visible to customers.</p>
          <p><a href="${process.env.CLIENT_URL}/dashboard">Pay now to restore your business</a></p>
        `,
      });
    }
  }

  // 3. Active subscriptions that have expired (30 days passed) — back to past_due
  const expiredActive = await Business.find({
    subscriptionStatus: "active",
    subscriptionPaidUntil: { $lte: now },
  });

  for (const business of expiredActive) {
    const graceEnd = new Date();
    graceEnd.setDate(graceEnd.getDate() + GRACE_DAYS);

    business.subscriptionStatus = "past_due";
    business.gracePeriodEndsAt = graceEnd;
    await business.save();
  }

  console.log(
    `Subscription check: ${endingTrials.length} trial(s) ended, ${overdue.length} suspended, ${expiredActive.length} renewal(s) due.`
  );
};

export default checkSubscriptions;
