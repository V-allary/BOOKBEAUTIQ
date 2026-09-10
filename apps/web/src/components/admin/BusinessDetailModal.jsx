import { API_URL } from "../../config";

function BusinessDetailModal({ business, onClose, onApprove, onReject, processing }) {
  if (!business) return null;

  const owner = business.owner;

  const documentUrl = (doc) =>
    doc?.startsWith("/uploads/") ? `${API_URL}${doc}` : doc;

  const imageUrl = business.image?.startsWith("/uploads/")
    ? `${API_URL}${business.image}`
    : business.image;

  const statusStyles = {
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
    pending: "bg-yellow-50 text-yellow-700",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E2DF] px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F3F1EF] text-lg font-bold text-[#242424]">
              {imageUrl ? (
                <img src={imageUrl} alt={business.name} className="h-full w-full object-cover" />
              ) : (
                business.name?.charAt(0)?.toUpperCase() || "B"
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#242424]">{business.name}</h2>
              <p className="mt-0.5 text-sm text-gray-500">{business.category} · {business.location}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F4F2] text-lg text-[#555] transition hover:bg-[#F2E8EC] hover:text-[#9D536D]"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(90vh-160px)] overflow-y-auto px-6 py-6 sm:px-8">

          {/* Status */}
          <div className="mb-6 flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[business.status] || statusStyles.pending}`}>
              {business.status || "pending"}
            </span>
            <span className="text-xs text-gray-400">
              Subscription: {business.subscriptionStatus || "—"}
            </span>
          </div>

          {/* Business Info */}
          <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B96882]">Business Details</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="mt-0.5 font-semibold text-[#242424]">{business.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="mt-0.5 font-semibold text-[#242424]">{business.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Opening Hours</p>
                <p className="mt-0.5 font-semibold text-[#242424]">{business.openingHours || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Starting Price</p>
                <p className="mt-0.5 font-semibold text-[#242424]">{business.price || "Not provided"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400">Description</p>
                <p className="mt-0.5 text-sm leading-6 text-gray-600">{business.description || "No description provided."}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Payout Account</p>
                <p className="mt-0.5 font-semibold text-[#242424]">
                  {business.paystackSubaccountCode ? `Linked — ${business.bankName || "Bank"}` : "Not linked"}
                </p>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="mt-5 rounded-2xl border border-[#E5E2DF] bg-white p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B96882]">Owner</p>
            {owner ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="mt-0.5 font-semibold text-[#242424]">{owner.firstName} {owner.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="mt-0.5 font-semibold text-[#242424]">{owner.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="mt-0.5 font-semibold text-[#242424]">{owner.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Verification Status</p>
                  <p className="mt-0.5 font-semibold capitalize text-[#242424]">{owner.verificationStatus || "unverified"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Owner information unavailable.</p>
            )}
          </div>

          {/* Verification Documents */}
          <div className="mt-5 rounded-2xl border border-[#E5E2DF] bg-white p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B96882]">Verification Documents</p>

            {owner ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-400">Legal Business Name</p>
                    <p className="mt-0.5 font-semibold text-[#242424]">{owner.legalBusinessName || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Registration Number</p>
                    <p className="mt-0.5 font-semibold text-[#242424]">{owner.businessRegistrationNumber || "Not provided"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-400">Business Address</p>
                    <p className="mt-0.5 font-semibold text-[#242424]">{owner.businessAddress || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Country of Registration</p>
                    <p className="mt-0.5 font-semibold text-[#242424]">{owner.countryOfRegistration || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#E5E2DF] p-4">
                    <p className="text-xs text-gray-400">Identity Document ({owner.identityDocumentType?.replace("_", " ") || "type unknown"})</p>
                    {owner.identityDocument ? (
                      <a
                        href={documentUrl(owner.identityDocument)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-[#B96882] underline"
                      >
                        View document →
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">Not submitted</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#E5E2DF] p-4">
                    <p className="text-xs text-gray-400">Business Registration Document</p>
                    {owner.businessDocument ? (
                      <a
                        href={documentUrl(owner.businessDocument)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-[#B96882] underline"
                      >
                        View document →
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">Not submitted</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No verification data available.</p>
            )}
          </div>

        </div>

        {/* Actions */}
        {business.status === "pending" && (
          <div className="flex gap-3 border-t border-[#E5E2DF] px-6 py-5 sm:px-8">
            <button
              onClick={() => onApprove(business._id)}
              disabled={processing || !business.paystackSubaccountCode}
              title={!business.paystackSubaccountCode ? "This business must link a payout account before it can be approved." : ""}
              className="flex-1 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? "Processing..." : "✓ Approve Business"}
            </button>
            <button
              onClick={() => onReject(business._id)}
              disabled={processing}
              className="flex-1 rounded-xl bg-[#242424] px-6 py-3 font-semibold text-white transition hover:bg-[#B96882] disabled:opacity-40"
            >
              ✕ Reject Business
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default BusinessDetailModal;
