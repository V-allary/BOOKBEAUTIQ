import Business from "../models/Business.js";
import notify from "./notify.js";

const GRACE_DAYS = 3;

const checkSubscriptions = async () => {
  const now = new Date();

  // 1. Trials that just ended — move to past_due, start grace period, notify them
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
      await notify({
        userId: business.owner._id,
        type: "subscription_reminder",
        title: "Your free trial has ended",
        message: `Your 7-day free trial for ${business.name} has ended. Please pay within ${GRACE_DAYS} days to stay visible.`,
        email: business.owner.email,
        link: "/dashboard",
        emailHtml: `
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
      await notify({
        userId: business.owner._id,
        type: "subscription_reminder",
        title: "Your business has been suspended",
        message: `${business.name} is suspended due to an unpaid subscription and is no longer visible to customers.`,
        email: business.owner.email,
        link: "/dashboard",
        emailHtml: `
          <p>Hi ${business.owner.firstName || "there"},</p>
          <p><strong>${business.name}</strong> is now suspended due to an unpaid subscription and is no longer visible to customers.</p>
          <p><a href="${process.env.CLIENT_URL}/dashboard">Pay now to restore your business</a></p>
        `,
      });
    }
  }

  // 3. Active subscriptions that have expired (30 days passed) — back to past_due
     // 3. Active subscriptions that have expired (30 days passed) — back to past_due
     const expiredActive = await Business.find({
      subscriptionStatus: "active",
      subscriptionPaidUntil: { $lte: now },
      autoRenew: false,
    }).populate("owner", "email firstName");
  
  for (const business of expiredActive) {
    const graceEnd = new Date();
    graceEnd.setDate(graceEnd.getDate() + GRACE_DAYS);

    business.subscriptionStatus = "past_due";
    business.gracePeriodEndsAt = graceEnd;
    await business.save();

    if (business.owner?.email) {
      await notify({
        userId: business.owner._id,
        type: "subscription_reminder",
        title: "Time to renew your subscription",
        message: `Your subscription for ${business.name} has expired. Please renew within ${GRACE_DAYS} days to stay visible.`,
        email: business.owner.email,
        link: "/dashboard",
        emailHtml: `
          <p>Hi ${business.owner.firstName || "there"},</p>
          <p>Your subscription for <strong>${business.name}</strong> has expired.</p>
          <p>Please renew within ${GRACE_DAYS} days to keep your business visible on BookBeautiq.</p>
          <p><a href="${process.env.CLIENT_URL}/dashboard">Renew now from your dashboard</a></p>
        `,
      });
    }
  }

    // 4. Recurring reminders — re-notify every 2 days while still past_due
    const REMINDER_INTERVAL_DAYS = 2;
    const reminderCutoff = new Date();
    reminderCutoff.setDate(reminderCutoff.getDate() - REMINDER_INTERVAL_DAYS);
  
    const stillUnpaid = await Business.find({
      subscriptionStatus: "past_due",
      $or: [
        { lastReminderSentAt: null },
        { lastReminderSentAt: { $lte: reminderCutoff } },
      ],
    }).populate("owner", "email firstName");
  
    for (const business of stillUnpaid) {
      if (business.owner?.email) {
        await notify({
          userId: business.owner._id,
          type: "subscription_reminder",
          title: "Payment still needed",
          message: `${business.name}'s subscription payment is still outstanding.`,
          email: business.owner.email,
          link: "/dashboard",
          emailHtml: `
            <p>Hi ${business.owner.firstName || "there"},</p>
            <p>Your subscription payment for <strong>${business.name}</strong> is still outstanding.</p>
            <p><a href="${process.env.CLIENT_URL}/dashboard">Pay now to avoid suspension</a></p>
          `,
        });
        business.lastReminderSentAt = new Date();
        await business.save();
      }
    }
  

};

export default checkSubscriptions;
