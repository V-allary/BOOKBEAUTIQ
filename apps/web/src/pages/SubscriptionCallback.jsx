import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

function SubscriptionCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/subscriptions/verify/${reference}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Verification failed.");
        setStatus("success");
      } catch (err) {
        setStatus("failed");
        setMessage(err.message);
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F6] px-6">
      <div className="max-w-lg rounded-2xl border border-[#E5E2DF] bg-white p-10 text-center shadow-sm">
        {status === "verifying" && (
          <>
            <div className="text-4xl">⏳</div>
            <h1 className="mt-4 text-2xl font-bold text-[#242424]">Confirming your payment...</h1>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl">✓</div>
            <h1 className="mt-4 text-2xl font-bold text-[#242424]">Subscription Active!</h1>
            <p className="mt-2 text-gray-500">Your business is now visible to customers again.</p>
            <Link
              to="/dashboard"
              className="mt-6 inline-block rounded-xl bg-[#242424] px-6 py-3 font-semibold text-white transition hover:bg-[#B96882]"
            >
              Go to Dashboard
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="text-5xl">✕</div>
            <h1 className="mt-4 text-2xl font-bold text-[#242424]">Payment Not Confirmed</h1>
            <p className="mt-2 text-gray-500">{message || "Something went wrong verifying your payment."}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default SubscriptionCallback;
