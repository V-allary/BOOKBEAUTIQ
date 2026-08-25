import { useState } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    firstName: storedUser?.firstName || "",
    lastName: storedUser?.lastName || "",
    phone: storedUser?.phone || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update profile.");

      const updatedUser = { ...storedUser, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF8] px-6 py-12">
      <div className="mx-auto max-w-2xl">

        <Link to="/dashboard" className="text-sm font-semibold text-[#F2542D] hover:underline">
          ← Back to Dashboard
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-[#14171A]">My Profile</h1>
          <p className="mt-2 text-gray-500">Manage your personal information.</p>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm">
            <p className="text-gray-500">
              Email: <span className="font-semibold text-[#14171A]">{storedUser?.email}</span>
            </p>
            <p className="mt-1 text-gray-500">
              Account Type: <span className="font-semibold capitalize text-[#14171A]">{storedUser?.role}</span>
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">{message}</div>
          )}
          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-xl border p-4 outline-none focus:border-[#F2542D]"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-xl border p-4 outline-none focus:border-[#F2542D]"
                required
              />
            </div>

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border p-4 outline-none focus:border-[#F2542D]"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#F2542D] py-4 font-semibold text-white transition hover:bg-[#D8431F] disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Profile;