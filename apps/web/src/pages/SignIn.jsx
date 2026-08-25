import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (
        data.user.role === "business" &&
        data.user.verificationStatus !== "verified"
      ) {
        navigate("/verify-account");
      } else {
        navigate("/dashboard");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] px-4 py-3.5 text-sm text-[#242424] outline-none transition placeholder:text-[#999] focus:border-[#C9859D] focus:bg-white focus:ring-4 focus:ring-[#D97CA5]/10";

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
            <span className="text-[#9D536D]">
              Beautiq
            </span>
          </Link>

          <p className="mt-2 text-sm text-gray-500">
            Your beauty, your way.
          </p>

        </div>

        {/* ======================================
            SIGN IN CARD
        ====================================== */}

        <div className="rounded-[28px] border border-[#E5E2DF] bg-white p-6 shadow-[0_15px_50px_rgba(30,25,25,0.06)] sm:p-8">

          {/* HEADER */}

          <div className="mb-7">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2E8EC] text-lg text-[#9D536D]">
              ✦
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Sign in to your BookBeautiq account.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                required
              />

            </div>

            {/* PASSWORD */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#9D536D] transition hover:text-[#7E4057] hover:underline"
                >
                  Forgot password?
                </Link>

              </div>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                required
              />

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#242424] py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#9D536D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>

          </form>

          {/* SIGN UP */}

          <div className="mt-7 border-t border-[#ECE9E6] pt-6 text-center">

            <p className="text-sm text-gray-500">
              Don't have an account?{" "}

              <Link
                to="/signup"
                className="font-bold text-[#9D536D] transition hover:text-[#7E4057] hover:underline"
              >
                Create Account
              </Link>
            </p>

          </div>

        </div>

        {/* FOOTER NOTE */}

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          Sign in to manage your BookBeautiq bookings and appointments.
        </p>

      </div>

    </div>
  );
}

export default SignIn;