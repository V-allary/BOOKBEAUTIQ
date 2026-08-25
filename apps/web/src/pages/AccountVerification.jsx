import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AccountVerification() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [status, setStatus] = useState(user?.verificationStatus || "unverified");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [identityFile, setIdentityFile] = useState(null);
  const [businessDocFile, setBusinessDocFile] = useState(null);

  const [formData, setFormData] = useState({
    identityDocumentType: "",
    legalBusinessName: "",
    businessRegistrationNumber: "",
    businessAddress: "",
    countryOfRegistration: "",
  });

  // Redirect verified owners straight to onboarding
  useEffect(() => {
    if (status === "verified") {
      navigate("/onboarding");
    }
  }, [status, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadFile = async (file) => {
    const data = new FormData();
    data.append("image", file);

    const response = await fetch("http://localhost:5001/api/uploads", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Document upload failed.");
    }

    return result.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identityFile || !businessDocFile) {
      setError(
        "Both your identity document and business document are required."
      );
      return;
    }

    if (!formData.identityDocumentType) {
      setError("Please select an identity document type.");
      return;
    }

    setSubmitting(true);

    try {
      const identityDocument = await uploadFile(identityFile);
      const businessDocument = await uploadFile(businessDocFile);

      const response = await fetch(
        "http://localhost:5001/api/verification/submit",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            identityDocument,
            businessDocument,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Verification submission failed."
        );
      }

      const updatedUser = {
        ...user,
        verificationStatus: "under_review",
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setStatus("under_review");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "under_review") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F6] px-6">
        <div className="max-w-lg rounded-3xl bg-white p-10 text-center shadow-lg">

          <div className="text-5xl">⏳</div>

          <h1 className="mt-5 text-3xl font-bold text-[#242424]">
            Verification Under Review
          </h1>

          <p className="mt-4 leading-7 text-gray-500">
            We've received your identity and business documents. Our team is
            reviewing them — this usually takes 1–2 business days.
          </p>

          <div className="mt-6 rounded-2xl bg-[#F7EEF1] p-4 text-sm text-[#B96882]">
            You won't be able to list a business until your account is
            verified.
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F6] px-6 py-12">

      <div className="mx-auto max-w-2xl">

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wide text-[#B96882]">
            Account Verification
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#242424]">
            Verify Your Identity & Business
          </h1>

          <p className="mt-3 text-gray-600">
            To keep BookBeautiq trustworthy, every business account must
            verify who they are and prove their business exists before listing
            any services.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl bg-white p-8 shadow-lg"
        >

          {status === "rejected" && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              Your previous submission was rejected
              {formData.verificationNotes
                ? `: ${formData.verificationNotes}`
                : "."}{" "}
              Please review and resubmit below.
            </div>
          )}

          {/* IDENTITY SECTION */}

          <div>

            <h2 className="mb-4 text-xl font-bold text-[#242424]">
              1. Identity Verification
            </h2>

            <label className="mb-2 block font-medium text-gray-700">
              Document Type
            </label>

            <select
              name="identityDocumentType"
              value={formData.identityDocumentType}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#E5E2DF] p-4 outline-none transition focus:border-[#B96882] focus:ring-1 focus:ring-[#B96882]/20"
              required
            >
              <option value="">Select document type</option>
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
              <option value="drivers_license">
                Driver's License
              </option>
            </select>

            <label className="mb-2 mt-4 block font-medium text-gray-700">
              Upload Document
            </label>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIdentityFile(e.target.files[0])}
              className="w-full rounded-xl border border-dashed border-[#D9A9B8] p-4 transition file:mr-4 file:rounded-lg file:border-0 file:bg-[#F7EEF1] file:px-4 file:py-2 file:font-semibold file:text-[#B96882] hover:border-[#B96882]"
              required
            />

          </div>

          {/* BUSINESS SECTION */}

          <div>

            <h2 className="mb-4 text-xl font-bold text-[#242424]">
              2. Business Verification
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                name="legalBusinessName"
                placeholder="Legal Business Name"
                value={formData.legalBusinessName}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E5E2DF] p-4 outline-none transition focus:border-[#B96882] focus:ring-1 focus:ring-[#B96882]/20"
                required
              />

              <input
                type="text"
                name="businessRegistrationNumber"
                placeholder="Business Registration Number"
                value={formData.businessRegistrationNumber}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E5E2DF] p-4 outline-none transition focus:border-[#B96882] focus:ring-1 focus:ring-[#B96882]/20"
                required
              />

              <textarea
                name="businessAddress"
                placeholder="Registered Business Address"
                value={formData.businessAddress}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-xl border border-[#E5E2DF] p-4 outline-none transition focus:border-[#B96882] focus:ring-1 focus:ring-[#B96882]/20"
                required
              />

              <input
                type="text"
                name="countryOfRegistration"
                placeholder="Country of Registration"
                value={formData.countryOfRegistration}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E5E2DF] p-4 outline-none transition focus:border-[#B96882] focus:ring-1 focus:ring-[#B96882]/20"
                required
              />

              <label className="mb-2 block font-medium text-gray-700">
                Business Registration Document
              </label>

              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setBusinessDocFile(e.target.files[0])}
                className="w-full rounded-xl border border-dashed border-[#D9A9B8] p-4 transition file:mr-4 file:rounded-lg file:border-0 file:bg-[#F7EEF1] file:px-4 file:py-2 file:font-semibold file:text-[#B96882] hover:border-[#B96882]"
                required
              />

            </div>

          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#B96882] py-4 font-semibold text-white transition hover:bg-[#A95772] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : "Submit for Verification"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default AccountVerification;