import { useEffect, useState } from "react";
import { API_URL } from "../config";

function ReferralCard({ token }) {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/api/referrals/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (response.ok) setData(result);
      } catch (error) {
        console.error("Error loading referral info:", error);
      }
    };
    load();
  }, [token]);

  if (!data) return null;

  const shareText = `I use BookBeautiq to get bookings and paid deposits for my beauty business. Join using my link: ${data.link}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your referral link:", data.link);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E5E2DF] bg-white p-6 shadow-sm">

      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2E8EC] text-lg text-[#9D536D]">
          ✦
        </div>

        <div>
          <h2 className="font-bold text-[#242424]">Refer a business owner</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            Get <strong>30 days free</strong> each time a business you refer
            subscribes. Up to {data.yearlyCap} free months a year.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] p-3">
        <p className="min-w-0 flex-1 truncate text-sm text-gray-600">{data.link}</p>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded-xl bg-[#242424] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9D536D]"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-xl border border-[#E5E2DF] px-5 py-3 text-center text-sm font-semibold text-[#242424] transition hover:bg-[#F5F4F2]"
        >
          Share on WhatsApp
        </a>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#ECE9E6] pt-5 text-center">
        <div>
          <p className="text-2xl font-bold text-[#242424]">{data.signedUp}</p>
          <p className="text-xs text-gray-400">Signed up</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#242424]">{data.rewarded}</p>
          <p className="text-xs text-gray-400">Free months earned</p>
        </div>
      </div>

      {data.bankedDays > 0 && (
        <p className="mt-4 rounded-xl bg-[#F2E8EC] p-3 text-xs leading-5 text-[#9D536D]">
          You have {data.bankedDays} free days waiting. They start the next time
          you subscribe.
        </p>
      )}

      {data.remainingThisYear === 0 && (
        <p className="mt-4 text-xs text-gray-400">
          You've reached the limit of {data.yearlyCap} free months in the last 12
          months. New referrals will still join, but won't earn more free time
          until the limit resets.
        </p>
      )}

    </div>
  );
}

export default ReferralCard;