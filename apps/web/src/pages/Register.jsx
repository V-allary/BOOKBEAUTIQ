import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        "http://localhost:50001/api/users/register",
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
        throw new Error(
          data.message || "Registration failed."
        );
      }

      alert("Account created successfully!");

      navigate("/login");
    } catch (error) {
      console.error(error);
      setError(error.message);
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
            Discover beauty. Book with confidence.
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
              Create Your Account
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Join BookBeautiq and discover beauty professionals near you.
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

            {/* NAME */}

            <div className="grid gap-4 sm:grid-cols-2">

              <div>

                <label
                  htmlFor="firstName"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

              </div>

              <div>

                <label
                  htmlFor="lastName"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

              </div>

            </div>

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

            {/* PHONE */}

            <div>

              <label
                htmlFor="phone"
                className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                required
                minLength={6}
              />

              <p className="mt-2 text-xs text-gray-400">
                Must be at least 6 characters.
              </p>

            </div>

            {/* ACCOUNT TYPE */}

            <div>

              <label
                htmlFor="role"
                className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                Account Type
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={inputClass}
              >

                <option value="customer">
                  Customer
                </option>

                <option value="business">
                  Business Owner
                </option>

              </select>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#B96882] py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#A95772] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* LOGIN */}

          <div className="mt-7 border-t border-[#ECE9E6] pt-6 text-center">

            <p className="text-sm text-gray-500">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-bold text-[#B96882] transition hover:text-[#A95772] hover:underline"
              >
                Login
              </Link>

            </p>

          </div>

        </div>

        {/* FOOTER NOTE */}

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          By creating an account, you can discover and book beauty services through BookBeautiq.
        </p>

      </div>

    </div>
  );
}

export default Register;