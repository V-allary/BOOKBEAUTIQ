import Business from "../models/Business.js";
import User from "../models/User.js";
import notify from "../utils/notify.js";

const GRACE_PERIOD_DAYS = 3;

// Runs daily. Moves businesses through:
// trialing/active (paid-through date passed) -> past_due (grace period starts)
// past_due (grace period passed) -> suspended (hidden from customers)
// Paying at any point is handled separately, by verifySubscriptionPayment.
const runSubscriptionCheck = async () => {
  const now = new Date();

  // ==========================================
  // STEP 1 — TRIAL/PAYMENT EXPIRED, START GRACE PERIOD
  // ==========================================

  const expiring = await Business.find({
    subscriptionStatus: { $in: ["trialing", "active"] },
    $or: [
      { subscriptionStatus: "trialing", trialEndsAt: { $lte: now } },
      { subscriptionStatus: "active", subscriptionPaidUntil: { $lte: now } },
    ],
  });

  for (const business of expiring) {
    const gracePeriodEndsAt = new Date(now);
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + GRACE_PERIOD_DAYS);

    business.subscriptionStatus = "past_due";
    business.gracePeriodEndsAt = gracePeriodEndsAt;
    business.lastReminderSentAt = now;
    await business.save();

    const owner = await User.findById(business.owner);
    if (owner) {
      try {
        await notify({
          userId: owner._id,
          type: "subscription_reminder",
          title: "Your BookBeautiq subscription needs payment",
          message: `${business.name}'s subscription has ended. Pay within ${GRACE_PERIOD_DAYS} days to keep your listing visible to customers.`,
          email: owner.email,
          link: "/dashboard",
          emailHtml: `
            <p>Hi ${owner.firstName},</p>
            <p>${business.name}'s subscription has ended. Your listing is still visible to customers for now, but will be hidden in ${GRACE_PERIOD_DAYS} days unless you pay.</p>
            <p><a href="${process.env.CLIENT_URL}/dashboard">Pay now from your dashboard</a></p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send subscription reminder:", emailError);
      }
    }
  }

  // ==========================================
  // STEP 2 — GRACE PERIOD EXPIRED, HIDE LISTING
  // ==========================================

  const overdue = await Business.find({
    subscriptionStatus: "past_due",
    gracePeriodEndsAt: { $lte: now },
  });

  for (const business of overdue) {
    business.subscriptionStatus = "suspended";
    await business.save();

    const owner = await User.findById(business.owner);
    if (owner) {
      try {
        await notify({
          userId: owner._id,
          type: "subscription_reminder",
          title: "Your BookBeautiq listing has been hidden",
          message: `${business.name}'s listing is now hidden from customers because the subscription wasn't paid. Pay at any time to restore visibility immediately.`,
          email: owner.email,
          link: "/dashboard",
          emailHtml: `
            <p>Hi ${owner.firstName},</p>
            <p>${business.name}'s listing is now hidden from customers because the subscription grace period has ended.</p>
            <p>You can pay at any time to restore visibility immediately — there's no need to contact support.</p>
            <p><a href="${process.env.CLIENT_URL}/dashboard">Pay now from your dashboard</a></p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send suspension notice:", emailError);
      }
    }
  }

  console.log(
    `Subscription check: ${expiring.length} moved to past_due, ${overdue.length} suspended.`
  );
};

export default runSubscriptionCheck;