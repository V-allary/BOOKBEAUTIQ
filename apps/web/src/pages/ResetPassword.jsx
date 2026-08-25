import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5001/api/users/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Reset failed."
        );
      }

      setSuccess(true);

      setTimeout(() => navigate("/signin"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] px-4 py-3.5 text-sm text-[#242424] outline-none transition placeholder:text-[#999] focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10";

  return (
    <div className="min-h-screen bg-[#F7F7F6] px-5 py-10 sm:px-8 sm:py-14">

      <div className="mx-auto max-w-lg">

        {/* ======================================
            BRAND
        ====================================== */}

        <div className="mb-8 text-center">

          <Link
            to="/"
            className="inline-block text-2xl font-bold tracking-tight text-[#242424]"
          >
            Book
            <span className="text-[#B96882]">
              Beautiq
            </span>
          </Link>

          <p className="mt-2 text-sm text-gray-500">
            Your beauty, your way.
          </p>

        </div>

        {/* ======================================
            CARD
        ====================================== */}

        <div className="rounded-[28px] border border-[#E5E2DF] bg-white p-6 shadow-[0_15px_50px_rgba(30,25,25,0.06)] sm:p-8">

          {/* HEADER */}

          <div className="mb-7">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7EEF1] text-lg text-[#B96882]">
              ✦
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
              Set a New Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Create a new password for your BookBeautiq account.
            </p>

          </div>

          {/* SUCCESS */}

          {success ? (

            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  ✓
                </div>

                <div>

                  <p className="font-semibold text-green-800">
                    Password reset successfully
                  </p>

                  <p className="mt-1 text-sm leading-5 text-green-700">
                    Redirecting you to sign in...
                  </p>

                </div>

              </div>

            </div>

          ) : (

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600">
                  {error}
                </div>
              )}

              {/* NEW PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  New Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className={inputClass}
                  required
                  minLength={6}
                />

              </div>

              {/* CONFIRM PASSWORD */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className={inputClass}
                  required
                  minLength={6}
                />

              </div>

              {/* PASSWORD REQUIREMENT */}

              <div className="rounded-xl bg-[#F7F6F5] px-4 py-3">

                <p className="text-xs leading-5 text-gray-500">
                  Your password must contain at least 6 characters.
                </p>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#B96882] py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#A95772] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password"}
              </button>

            </form>

          )}

          {/* BACK TO SIGN IN */}

          <div className="mt-7 border-t border-[#ECE9E6] pt-6 text-center">

            <Link
              to="/signin"
              className="text-sm font-bold text-[#B96882] transition hover:text-[#A95772] hover:underline"
            >
              ← Back to Sign In
            </Link>

          </div>

        </div>

        {/* FOOTER NOTE */}

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          Keep your account secure with a strong password.
        </p>

      </div>

    </div>
  );
}

export default ResetPassword;