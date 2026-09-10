import { useState } from "react";
import { API_URL } from "../config";

function SubscriptionCard({ business, token, onUpdated }) {
  const [submitting, setSubmitting] = useState(false);
  const [autoRenewChecked, setAutoRenewChecked] = useState(true);
  const [togglingRenew, setTogglingRenew] = useState(false);

  const planLabel = { independent: "Independent — KES 1,500/mo", team: "Team — KES 2,500/mo" };

  const handlePay = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_URL}/api/subscriptions/${business._id}/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ autoRenew: autoRenewChecked }),
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

  const handleToggleAutoRenew = async (nextValue) => {
    setTogglingRenew(true);
    try {
      const response = await fetch(
        `${API_URL}/api/subscriptions/${business._id}/auto-renew`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ autoRenew: nextValue }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update auto-renew.");
      if (onUpdated) onUpdated();
    } catch (error) {
      alert(error.message);
    } finally {
      setTogglingRenew(false);
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
        ? `Your subscription ${business.autoRenew ? "renews" : "expires"} on ${new Date(business.subscriptionPaidUntil).toLocaleDateString()}.`
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

  // Payment is required for past_due/suspended, and optionally
  // available early during the trial for anyone who wants to pay ahead.
  const needsPayment = business.subscriptionStatus === "past_due" || business.subscriptionStatus === "suspended";
  const canPayEarly = business.subscriptionStatus === "trialing";
  const showPaymentSection = needsPayment || canPayEarly;

  const hasSavedCard = !!business.paystackAuthorizationCode;

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

      {/* Payment Method */}
      <div className="mt-5 border-t border-[#ECE9E6] pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Payment Method</p>

        {hasSavedCard ? (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] p-4">
            <div>
              <p className="text-sm font-semibold text-[#242424]">
                {business.paystackCardBrand?.toUpperCase() || "Card"} •••• {business.paystackCardLast4}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Auto-renew is {business.autoRenew ? "on" : "off"}
              </p>
            </div>
            <button
              onClick={() => handleToggleAutoRenew(!business.autoRenew)}
              disabled={togglingRenew}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                business.autoRenew
                  ? "border border-[#E5E2DF] text-[#242424] hover:bg-white"
                  : "bg-[#242424] text-white hover:bg-[#9D536D]"
              }`}
            >
              {togglingRenew ? "..." : business.autoRenew ? "Turn Off" : "Turn On"}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">
            No saved card yet. Check the box below when you pay to save your card and enable auto-renew.
          </p>
        )}
      </div>

      {showPaymentSection && (
        <div className="mt-5 border-t border-[#ECE9E6] pt-5">
          {!hasSavedCard && (
            <label className="mb-4 flex items-start gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRenewChecked}
                onChange={(e) => setAutoRenewChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#242424] focus:ring-[#B96882]"
              />
              <span>
                Save my card and automatically renew this subscription each month. You can turn this off anytime.
              </span>
            </label>
          )}

          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full rounded-xl bg-[#242424] py-3.5 text-sm font-bold text-white transition hover:bg-[#B96882] disabled:opacity-60"
          >
            {submitting
              ? "Redirecting..."
              : canPayEarly
              ? "Pay Now (Skip Trial)"
              : "Pay Subscription"}
          </button>

          {canPayEarly && (
            <p className="mt-3 text-center text-xs text-gray-400">
              Paying now starts your 30-day subscription immediately — you won't need to pay again until it renews.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SubscriptionCard;
