import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref");

  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/payments/verify/${reference}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Payment verification failed."
          );
        }

        setStatus("success");
      } catch (err) {
        setStatus("failed");
        setMessage(err.message);
      }
    };

    verify();
  }, [reference]);

  return (
    <>
      <Navbar />

      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F6] px-6 py-12">

        <div className="w-full max-w-lg rounded-[28px] border border-[#E5E2DF] bg-white p-10 text-center shadow-sm">

          {/* =================================
              VERIFYING
          ================================= */}

          {status === "verifying" && (
            <>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7EEF1] text-3xl">
                ⏳
              </div>

              <h1 className="mt-6 text-2xl font-bold text-[#242424]">
                Confirming your payment...
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                We're verifying your payment and confirming
                your booking. Please wait a moment.
              </p>

            </>
          )}

          {/* =================================
              SUCCESS
          ================================= */}

          {status === "success" && (
            <>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F7EEF1] text-3xl font-bold text-[#B96882]">
                ✓
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-[#B96882]">
                Payment successful
              </p>

              <h1 className="mt-2 text-2xl font-bold text-[#242424]">
                Booking Confirmed!
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Your deposit was received and your booking
                is confirmed.
              </p>

              <Link
                to="/"
                className="mt-7 inline-block rounded-xl bg-[#B96882] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#A95772]"
              >
                Back to Home
              </Link>

            </>
          )}

          {/* =================================
              FAILED
          ================================= */}

          {status === "failed" && (
            <>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-500">
                ✕
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-red-500">
                Payment issue
              </p>

              <h1 className="mt-2 text-2xl font-bold text-[#242424]">
                Payment Not Confirmed
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {message ||
                  "Something went wrong verifying your payment."}
              </p>

            </>
          )}

        </div>

      </main>

      <Footer />
    </>
  );
}

export default PaymentCallback;