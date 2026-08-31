import { useState } from "react";

function SubscriptionCard({ business, token, onUpdated }) {
  const [submitting, setSubmitting] = useState(false);

  const planLabel = { independent: "Independent — KES 1,500/mo", team: "Team — KES 2,500/mo" };

  const handlePay = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/subscriptions/${business._id}/initialize`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not start payment.");
      window.location.href = data.authorizationUrl;
    } catch (error) {
      alert(error.message);
      setSubmitting(false);
    }
  };

  const statusConfig = {
    trialing: {
      label: "Free Trial",
      bg: "bg-[#F2E8EC]",
      text: "text-[#9D536D]",
      message: business.trialEndsAt
        ? `Your free trial ends on ${new Date(business.trialEndsAt).toLocaleDateString()}.`
        : "You're on a free trial.",
    },
    active: {
      label: "Active",
      bg: "bg-green-50",
      text: "text-green-700",
      message: business.subscriptionPaidUntil
        ? `Your subscription renews on ${new Date(business.subscriptionPaidUntil).toLocaleDateString()}.`
        : "Your subscription is active.",
    },
    past_due: {
      label: "Payment Due",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      message: business.gracePeriodEndsAt
        ? `Please pay by ${new Date(business.gracePeriodEndsAt).toLocaleDateString()} to avoid suspension.`
        : "Your subscription payment is due.",
    },
    suspended: {
      label: "Suspended",
      bg: "bg-red-50",
      text: "text-red-700",
      message: "Your business is hidden from customers until you pay.",
    },
  };

  const config = statusConfig[business.subscriptionStatus] || statusConfig.trialing;
  const needsPayment = business.subscriptionStatus === "past_due" || business.subscriptionStatus === "suspended";

  return (
    <div className="rounded-2xl border border-[#E5E2DF] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#242424]">Subscription</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-500">{config.message}</p>

      <p className="mt-4 text-sm">
        <span className="text-gray-400">Plan: </span>
        <span className="font-semibold text-[#242424]">
          {planLabel[business.subscriptionPlan] || planLabel.independent}
        </span>
      </p>

      {needsPayment && (
        <button
          onClick={handlePay}
          disabled={submitting}
          className="mt-5 w-full rounded-xl bg-[#242424] py-3.5 text-sm font-bold text-white transition hover:bg-[#B96882] disabled:opacity-60"
        >
          {submitting ? "Redirecting..." : "Pay Subscription"}
        </button>
      )}
    </div>
  );
}

export default SubscriptionCard;
