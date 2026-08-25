import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    business,
    selectedService,
    selectedStaff,
    selectedDate,
    selectedTime,
    customerDetails,
  } = location.state || {};

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // ==========================================
  // CUSTOMER DETAILS
  // ==========================================

  const fallbackCustomerName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";

  const [formData, setFormData] = useState({
    customerName:
      customerDetails?.name ||
      fallbackCustomerName ||
      "",

    customerEmail:
      customerDetails?.email ||
      user?.email ||
      "",

    customerPhone:
      customerDetails?.phone ||
      user?.phone ||
      "",
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // VALIDATE BOOKING DATA
  // ==========================================

  if (
    !business ||
    !selectedService ||
    !selectedStaff ||
    !selectedDate ||
    !selectedTime
  ) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#F7F7F6] px-5 py-20 sm:px-8">

          <div className="mx-auto max-w-2xl rounded-[28px] border border-[#E5E2DF] bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7EEF1] text-2xl text-[#B96882]">
              ?
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[#242424]">
              No booking selected
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Please start your booking from a business page.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/explore")
              }
              className="mt-6 rounded-xl bg-[#242424] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B96882]"
            >
              Explore Beauty Services
            </button>

          </div>

        </main>

        <Footer />
      </>
    );
  }

  // ==========================================
  // DEPOSIT
  // ==========================================

  const depositAmount = Math.round(
    selectedService.price * 0.3
  );

  // ==========================================
  // HANDLE FORM CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================================
  // CONFIRM BOOKING
  // ==========================================

  const handleConfirm = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token");

      // ======================================
      // 1. CREATE BOOKING
      // ======================================

      const bookingResponse = await fetch(
        "http://localhost:5001/api/bookings",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            businessId: business._id,

            service: selectedService.name,

            staff: selectedStaff.name,

            date: `${selectedDate.day} ${selectedDate.date}`,

            time: selectedTime,

            depositAmount,

            ...formData,
          }),
        }
      );

      const bookingData =
        await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(
          bookingData.message ||
            "Booking failed."
        );
      }

      // ======================================
      // 2. INITIALIZE PAYMENT
      // ======================================

      const paymentResponse =
        await fetch(
          "http://localhost:5001/api/payments/initialize",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              bookingId:
                bookingData.booking._id,
            }),
          }
        );

      const paymentData =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.message ||
            "Payment setup failed."
        );
      }

      // ======================================
      // 3. REDIRECT TO PAYSTACK
      // ======================================

      window.location.href =
        paymentData.authorizationUrl;

    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while processing your booking."
      );

      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F7F7F6] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">

        <div className="mx-auto max-w-6xl">

          {/* ====================================
              PAGE HEADER
          ==================================== */}

          <div className="mb-8">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="mb-5 text-sm font-semibold text-gray-500 transition hover:text-[#B96882]"
            >
              ← Back to booking
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#B96882]">
              Almost there
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
              Confirm Your Booking
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Review your appointment details and enter your contact information before paying the deposit.
            </p>

          </div>

          {/* ====================================
              MAIN GRID
          ==================================== */}

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

            {/* ==================================
                LEFT — BOOKING DETAILS
            ================================== */}

            <div className="space-y-6">

              {/* APPOINTMENT */}

              <section className="rounded-[28px] border border-[#E5E2DF] bg-white p-6 shadow-sm sm:p-8">

                <div className="mb-6">

                  <p className="text-xs font-bold uppercase tracking-wider text-[#B96882]">
                    Appointment
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#242424]">
                    Your booking
                  </h2>

                </div>

                <div className="space-y-0 divide-y divide-[#ECE9E6]">

                  <div className="flex items-start justify-between gap-6 py-4 first:pt-0">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Business
                      </p>

                      <p className="mt-1 font-semibold text-[#242424]">
                        {business.name}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-start justify-between gap-6 py-4">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Service
                      </p>

                      <p className="mt-1 font-semibold text-[#242424]">
                        {selectedService.name}
                      </p>
                    </div>

                    <span className="shrink-0 font-bold text-[#B96882]">
                      KES{" "}
                      {selectedService.price}
                    </span>

                  </div>

                  <div className="flex items-start justify-between gap-6 py-4">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Professional
                      </p>

                      <p className="mt-1 font-semibold text-[#242424]">
                        {selectedStaff.name}
                      </p>
                    </div>

                  </div>

                  <div className="grid gap-4 py-4 sm:grid-cols-2">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Date
                      </p>

                      <p className="mt-1 font-semibold text-[#242424]">
                        {selectedDate.day}{" "}
                        {selectedDate.date}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Time
                      </p>

                      <p className="mt-1 font-semibold text-[#242424]">
                        {selectedTime}
                      </p>

                    </div>

                  </div>

                </div>

              </section>

              {/* ==================================
                  CUSTOMER INFORMATION
              ================================== */}

              <section className="rounded-[28px] border border-[#E5E2DF] bg-white p-6 shadow-sm sm:p-8">

                <div className="mb-6">

                  <p className="text-xs font-bold uppercase tracking-wider text-[#B96882]">
                    Contact information
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#242424]">
                    Your details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    We'll use these details to confirm your appointment.
                  </p>

                </div>

                <form
                  id="checkout-form"
                  onSubmit={
                    handleConfirm
                  }
                  className="space-y-4"
                >

                  <div>

                    <label
                      htmlFor="customerName"
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                    >
                      Full name
                    </label>

                    <input
                      id="customerName"
                      type="text"
                      name="customerName"
                      placeholder="Your full name"
                      value={
                        formData.customerName
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] px-4 py-3.5 text-sm text-[#242424] outline-none transition placeholder:text-gray-400 focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10"
                      required
                    />

                  </div>

                  <div>

                    <label
                      htmlFor="customerEmail"
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                    >
                      Email address
                    </label>

                    <input
                      id="customerEmail"
                      type="email"
                      name="customerEmail"
                      placeholder="you@example.com"
                      value={
                        formData.customerEmail
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] px-4 py-3.5 text-sm text-[#242424] outline-none transition placeholder:text-gray-400 focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10"
                      required
                    />

                  </div>

                  <div>

                    <label
                      htmlFor="customerPhone"
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                    >
                      Phone number
                    </label>

                    <input
                      id="customerPhone"
                      type="tel"
                      name="customerPhone"
                      placeholder="+254 700 000 000"
                      value={
                        formData.customerPhone
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] px-4 py-3.5 text-sm text-[#242424] outline-none transition placeholder:text-gray-400 focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10"
                      required
                    />

                  </div>

                </form>

              </section>

            </div>

            {/* ==================================
                RIGHT — PAYMENT SUMMARY
            ================================== */}

            <aside className="lg:sticky lg:top-24 lg:self-start">

              <section className="rounded-[28px] border border-[#E5E2DF] bg-white p-6 shadow-sm sm:p-8">

                <div className="mb-6">

                  <p className="text-xs font-bold uppercase tracking-wider text-[#B96882]">
                    Payment
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#242424]">
                    Booking summary
                  </h2>

                </div>

                <div className="space-y-4">

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-gray-500">
                      Service
                    </span>

                    <span className="text-right text-sm font-semibold text-[#242424]">
                      {selectedService.name}
                    </span>

                  </div>

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-gray-500">
                      Service price
                    </span>

                    <span className="text-sm font-semibold text-[#242424]">
                      KES{" "}
                      {selectedService.price}
                    </span>

                  </div>

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-gray-500">
                      Deposit
                    </span>

                    <span className="text-sm font-semibold text-[#B96882]">
                      30%
                    </span>

                  </div>

                  <div className="h-px bg-[#ECE9E6]" />

                  <div className="rounded-2xl bg-[#F7EEF1] p-5">

                    <p className="text-xs font-bold uppercase tracking-wide text-[#B96882]">
                      Due now
                    </p>

                    <p className="mt-1 text-3xl font-bold text-[#B96882]">
                      KES{" "}
                      {depositAmount}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      This is a 30% deposit. The remaining balance is paid directly at the business.
                    </p>

                  </div>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600">
                    {error}
                  </div>
                )}

                {/* PAYMENT BUTTON */}

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={
                    submitting
                  }
                  className="mt-6 w-full rounded-xl bg-[#242424] py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#B96882] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Redirecting to payment..."
                    : `Pay Deposit — KES ${depositAmount}`}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                  You'll be redirected to Paystack's secure payment page to complete your deposit.
                </p>

              </section>

              {/* GUEST NOTICE */}

              {!user && (
                <div className="mt-4 rounded-2xl border border-[#E5E2DF] bg-white p-4 text-center">

                  <p className="text-xs leading-5 text-gray-500">
                    Booking as a guest. Sign up for a BookBeautiq account to easily track your bookings next time.
                  </p>

                </div>
              )}

            </aside>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default Checkout;