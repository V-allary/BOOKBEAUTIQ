import Business from "../models/Business.js";
import paystackRequest from "./paystack.js";
import notify from "./notify.js";

const PLAN_PRICES = {
  independent: 1500,
  team: 2500,
};

const autoChargeSubscriptions = async () => {
  const now = new Date();

  // Businesses with auto-renew on whose subscription just expired
  const dueForRenewal = await Business.find({
    autoRenew: true,
    subscriptionStatus: { $in: ["active", "past_due"] },
    subscriptionPaidUntil: { $lte: now },
    paystackAuthorizationCode: { $ne: "" },
  }).populate("owner", "email firstName");

  let succeeded = 0;
  let failed = 0;

  for (const business of dueForRenewal) {
    const amount = PLAN_PRICES[business.subscriptionPlan] || PLAN_PRICES.independent;

    try {
      const result = await paystackRequest("/transaction/charge_authorization", "POST", {
        authorization_code: business.paystackAuthorizationCode,
        email: business.email || business.owner?.email,
        amount: amount * 100,
        currency: "KES",
      });

      if (result.status === "success") {
        const paidUntil = new Date();
        paidUntil.setDate(paidUntil.getDate() + 30);

        business.subscriptionStatus = "active";
        business.subscriptionPaidUntil = paidUntil;
        business.gracePeriodEndsAt = null;
        business.lastReminderSentAt = null;
        await business.save();

        succeeded++;

        if (business.owner?.email) {
          await notify({
            userId: business.owner._id,
            type: "payment_received",
            title: "Subscription renewed",
            message: `Your subscription for ${business.name} was automatically renewed — KES ${amount} charged.`,
            email: business.owner.email,
            link: "/dashboard",
          });
        }
      } else {
        throw new Error(result.gateway_response || "Charge failed");
      }
    } catch (error) {
      // Auto-charge failed — fall back to the normal manual past_due flow
      failed++;

      const graceEnd = new Date();
      graceEnd.setDate(graceEnd.getDate() + 3);

      business.subscriptionStatus = "past_due";
      business.gracePeriodEndsAt = graceEnd;
      await business.save();

      if (business.owner?.email) {
        await notify({
          userId: business.owner._id,
          type: "subscription_reminder",
          title: "Auto-renewal failed",
          message: `We couldn't automatically renew ${business.name}'s subscription. Please pay manually to avoid suspension.`,
          email: business.owner.email,
          link: "/dashboard",
          emailHtml: `
            <p>Hi ${business.owner.firstName || "there"},</p>
            <p>We tried to automatically renew your subscription for <strong>${business.name}</strong>, but the charge failed (${error.message}).</p>
            <p>Please pay manually within 3 days to avoid suspension.</p>
            <p><a href="${process.env.CLIENT_URL}/dashboard">Pay now from your dashboard</a></p>
          `,
        });
      }
    }
  }

  console.log(`Auto-charge run: ${succeeded} renewed, ${failed} failed and moved to past_due.`);
};

export default autoChargeSubscriptions;
