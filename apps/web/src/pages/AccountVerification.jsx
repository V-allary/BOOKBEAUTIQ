import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function AccountVerification() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const [status, setStatus] = useState(user?.verificationStatus || "unverified");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [identityFile, setIdentityFile] = useState(null);
  const [businessDocFile, setBusinessDocFile] = useState(null);
  const [verificationType, setVerificationType] = useState("");

  const [formData, setFormData] = useState({
    identityDocumentType: "",
    legalBusinessName: "",
    businessRegistrationNumber: "",
    businessAddress: "",
    countryOfRegistration: "",
    instagramUrl: "",
    tiktokUrl: "",
  });

  // Always check the real, current status from the server on load —
  // never trust the browser's cached copy, since it can go stale the
  // moment an admin approves/rejects while the owner is still logged in.
  useEffect(() => {
    const checkCurrentStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok && data.user) {
          const updatedUser = { ...user, verificationStatus: data.user.verificationStatus };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setStatus(data.user.verificationStatus);
          setRejectionNotes(data.user.verificationNotes || "");
        }
      } catch (err) {
        console.error("Error checking verification status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkCurrentStatus();
  }, []);

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

    const response = await fetch(`${API_URL}/api/uploads`, {
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

    if (!verificationType) {
      setError("Please choose how you work: licensed business or freelancer.");
      return;
    }

    if (!formData.identityDocumentType) {
      setError("Please select an identity document type.");
      return;
    }

    if (!identityFile) {
      setError("Please upload your identity document.");
      return;
    }

    if (
      verificationType === "freelance" &&
      !formData.instagramUrl.trim() &&
      !formData.tiktokUrl.trim()
    ) {
      setError("Please share at least one: your Instagram or your TikTok.");
      return;
    }

    setSubmitting(true);

    try {
      const identityDocument = await uploadFile(identityFile);

      const payload = {
        verificationType,
        identityDocumentType: formData.identityDocumentType,
        identityDocument,
      };

      if (verificationType === "licensed") {
        payload.legalBusinessName = formData.legalBusinessName;
        payload.businessRegistrationNumber = formData.businessRegistrationNumber;
        payload.businessAddress = formData.businessAddress;
        payload.countryOfRegistration = formData.countryOfRegistration;
        payload.businessDocument = businessDocFile
          ? await uploadFile(businessDocFile)
          : "";
      } else {
        payload.instagramUrl = formData.instagramUrl;
        payload.tiktokUrl = formData.tiktokUrl;
      }

      const response = await fetch(`${API_URL}/api/verification/submit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification submission failed.");
      }

      const updatedUser = { ...user, verificationStatus: "under_review" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setStatus("under_review");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#E5E2DF] p-4 outline-none transition focus:border-[#B96882] focus:ring-1 focus:ring-[#B96882]/20";

  const fileClass =
    "w-full rounded-xl border border-dashed border-[#D9A9B8] p-4 transition file:mr-4 file:rounded-lg file:border-0 file:bg-[#F7EEF1] file:px-4 file:py-2 file:font-semibold file:text-[#B96882] hover:border-[#B96882]";

  if (checkingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F6] px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E7E4E1] border-t-[#242424]" />
          <p className="mt-4 text-sm font-medium text-gray-500">Checking your verification status...</p>
        </div>
      </div>
    );
  }

  if (status === "under_review") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F6] px-6">
        <div className="max-w-lg rounded-3xl bg-white p-10 text-center shadow-lg">

          <div className="text-5xl">⏳</div>

          <h1 className="mt-5 text-3xl font-bold text-[#242424]">
            Verification Under Review
          </h1>

          <p className="mt-4 leading-7 text-gray-500">
            We've received your details. Our team is reviewing them — this
            usually takes 1–2 business days.
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
            Verify Your Identity & Work
          </h1>

          <p className="mt-3 text-gray-600">
            To keep BookBeautiq trustworthy, every professional verifies who
            they are and shows us their real work before listing any services.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl bg-white p-8 shadow-lg"
        >

          {status === "rejected" && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              Your previous submission was rejected
              {rejectionNotes ? `: ${rejectionNotes}` : "."}{" "}
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
              className={inputClass}
              required
            >
              <option value="">Select document type</option>
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
              <option value="drivers_license">Driver's License</option>
            </select>

            <label className="mb-2 mt-4 block font-medium text-gray-700">
              Upload Document
            </label>

            <p className="mb-2 text-xs text-gray-400">
              Make sure the whole document is visible, in focus, and free of glare. PDFs and photos are both accepted.
            </p>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIdentityFile(e.target.files[0])}
              className={fileClass}
              required
            />

          </div>

          {/* HOW YOU WORK */}

          <div>

            <h2 className="mb-4 text-xl font-bold text-[#242424]">
              2. How do you work?
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() => setVerificationType("licensed")}
                className={`rounded-2xl border p-4 text-left transition ${
                  verificationType === "licensed"
                    ? "border-[#B96882] bg-[#F7EEF1]"
                    : "border-[#E5E2DF] bg-white hover:border-[#D9A9B8]"
                }`}
              >
                <p className="font-bold text-[#242424]">Licensed business</p>
                <p className="mt-1 text-sm text-gray-500">
                  I own or work at a salon, spa or studio with a business
                  license.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVerificationType("freelance")}
                className={`rounded-2xl border p-4 text-left transition ${
                  verificationType === "freelance"
                    ? "border-[#B96882] bg-[#F7EEF1]"
                    : "border-[#E5E2DF] bg-white hover:border-[#D9A9B8]"
                }`}
              >
                <p className="font-bold text-[#242424]">Freelancer</p>
                <p className="mt-1 text-sm text-gray-500">
                  I work on my own and don't have a registered business.
                </p>
              </button>

            </div>

            {verificationType === "licensed" && (
              <div className="mt-6 space-y-4">

                <input
                  type="text"
                  name="legalBusinessName"
                  placeholder="Business or salon name"
                  value={formData.legalBusinessName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

                <input
                  type="text"
                  name="businessRegistrationNumber"
                  placeholder="License or registration number"
                  value={formData.businessRegistrationNumber}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

                <textarea
                  name="businessAddress"
                  placeholder="Business address"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  rows="3"
                  className={inputClass}
                  required
                />

                <input
                  type="text"
                  name="countryOfRegistration"
                  placeholder="Country"
                  value={formData.countryOfRegistration}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    License or registration document{" "}
                    <span className="text-sm font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>

                  <p className="mb-2 text-xs text-gray-400">
                    A photo or PDF helps us approve you faster.
                  </p>

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setBusinessDocFile(e.target.files[0])}
                    className={fileClass}
                  />
                </div>

              </div>
            )}

            {verificationType === "freelance" && (
              <div className="mt-6 space-y-4">

                <p className="text-sm leading-6 text-gray-500">
                  Share at least one of your pages. Our team will look at your
                  work to confirm you're a real professional, so make sure the
                  account is <strong>public</strong>.
                </p>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagramUrl"
                    placeholder="instagram.com/yourname or @yourname"
                    value={formData.instagramUrl}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    TikTok
                  </label>
                  <input
                    type="text"
                    name="tiktokUrl"
                    placeholder="tiktok.com/@yourname or @yourname"
                    value={formData.tiktokUrl}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

              </div>
            )}

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
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default AccountVerification;