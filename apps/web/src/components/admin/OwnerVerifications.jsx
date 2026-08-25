import { useEffect, useState } from "react";

function OwnerVerifications() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPending = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/verification/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load verifications.");
      setPending(data);
    } catch (error) {
      console.error("Error loading owner verifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (userId) => {
    try {
      setProcessingId(userId);
      const response = await fetch(`http://localhost:5001/api/verification/${userId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to approve.");
      alert("Account verified successfully.");
      await fetchPending();
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    const notes = window.prompt("Why are you rejecting this verification?");
    if (notes === null) return;

    try {
      setProcessingId(userId);
      const response = await fetch(`http://localhost:5001/api/verification/${userId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to reject.");
      alert("Verification rejected.");
      await fetchPending();
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const documentUrl = (doc) =>
    doc?.startsWith("/uploads/") ? `http://localhost:5001${doc}` : doc;

  if (loading) {
    return (
      <div className="mt-12 rounded-3xl bg-white p-8 text-center shadow-lg">
        Loading owner verifications...
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D8431F]">
          Account Verification
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[#14171A]">
          Owner Verification Requests
        </h2>
        <p className="mt-2 text-gray-500">
          Review identity and business documents before approving business accounts.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center">
          <div className="text-4xl">✅</div>
          <h3 className="mt-3 text-lg font-semibold text-[#14171A]">No pending verifications</h3>
          <p className="mt-2 text-gray-500">No business accounts are currently waiting for review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.map((user) => (
            <div key={user._id} className="rounded-2xl border border-[#ECE9E6] p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#14171A]">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="mt-1 text-gray-500">{user.email}</p>
                  <p className="mt-1 text-gray-500">{user.phone}</p>
                </div>
                <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-[#D8431F]">
                  Under Review
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Identity Document Type</p>
                  <p className="mt-1 font-semibold capitalize">
                    {user.identityDocumentType?.replace("_", " ") || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Legal Business Name</p>
                  <p className="mt-1 font-semibold">{user.legalBusinessName || "Not provided"}</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="mt-1 font-semibold">{user.businessRegistrationNumber || "Not provided"}</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Country of Registration</p>
                  <p className="mt-1 font-semibold">{user.countryOfRegistration || "Not provided"}</p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 md:col-span-2">
                  <p className="text-sm text-gray-500">Business Address</p>
                  <p className="mt-1 font-semibold">{user.businessAddress || "Not provided"}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-[#14171A]">Submitted Documents</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-gray-500">Identity Document</p>
                    {user.identityDocument ? (
                      <a
                        href={documentUrl(user.identityDocument)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-sm font-semibold text-[#F2542D] underline"
                      >
                        View document
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">Not provided</p>
                    )}
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-gray-500">Business Registration Document</p>
                    {user.businessDocument ? (
                      <a
                        href={documentUrl(user.businessDocument)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-sm font-semibold text-[#F2542D] underline"
                      >
                        View document
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => handleApprove(user._id)}
                  disabled={processingId === user._id}
                  className="flex-1 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {processingId === user._id ? "Processing..." : "✓ Verify Account"}
                </button>

                <button
                  onClick={() => handleReject(user._id)}
                  disabled={processingId === user._id}
                  className="flex-1 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  ✕ Reject Verification
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default OwnerVerifications;
