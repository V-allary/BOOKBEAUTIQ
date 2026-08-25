import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/users/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong."
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F6] px-6 py-12">

      <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-lg">

        <div className="mb-2">

          <p className="text-sm font-semibold uppercase tracking-wide text-[#B96882]">
            Account Recovery
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#242424]">
            Reset Your Password
          </h1>

        </div>

        <p className="mt-2 text-gray-500">
          Enter the email on your account and we'll send you a reset link.
        </p>

        {submitted ? (

          <div className="mt-6 rounded-xl border border-[#D9EBDD] bg-[#F1F9F3] p-4 text-sm leading-6 text-green-700">
            If that email is registered, a reset link has been sent. Check
            your inbox.
          </div>

        ) : (

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] p-4 text-[#242424] outline-none transition placeholder:text-gray-400 focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10"
                required
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#B96882] py-4 font-semibold text-white transition hover:bg-[#A95772] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

          </form>

        )}

        <p className="mt-6 text-center text-gray-500">

          <Link
            to="/signin"
            className="font-semibold text-[#B96882] transition hover:text-[#A95772] hover:underline"
          >
            Back to Sign In
          </Link>

        </p>

      </div>

    </div>
  );
}

export default ForgotPassword;