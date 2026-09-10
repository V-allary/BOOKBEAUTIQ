import { useState } from "react";
import { API_URL } from "../../config";
import BusinessDetailModal from "./BusinessDetailModal";

function BusinessList({ businesses: businessesProp, fetchBusinesses: fetchBusinessesProp }) {
  const [businesses, setBusinesses] = useState(businessesProp || []);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [processing, setProcessing] = useState(false);

  const businessList = businessesProp || businesses;

  const fetchBusinesses = async () => {
    if (fetchBusinessesProp) return fetchBusinessesProp();

    try {
      const response = await fetch(`${API_URL}/api/businesses`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch businesses.");
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const deleteBusiness = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this business?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/businesses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete business.");
      alert("Business deleted successfully!");
      setSelectedBusiness(null);
      fetchBusinesses();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const endpoint = status === "approved" ? "approve" : "reject";

      const response = await fetch(`${API_URL}/api/businesses/${id}/${endpoint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to ${status} business.`);

      alert(data.message);
      setSelectedBusiness(null);
      fetchBusinesses();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  const imageUrl = (path) =>
    path?.startsWith("/uploads/") ? `${API_URL}${path}` : path;

  const statusStyles = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="mb-8 text-3xl font-bold text-[#242424]">
        Businesses
      </h2>

      {businessList.length === 0 ? (
        <p className="text-gray-500">No businesses available.</p>
      ) : (
        <div className="space-y-4">

          {businessList.map((business) => (

            <div
              key={business._id}
              className="rounded-2xl border border-[#ECE0E4] p-5 transition hover:border-[#D9C3CE]"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F3F1EF] font-bold text-[#242424]">
                    {business.image ? (
                      <img
                        src={imageUrl(business.image)}
                        alt={business.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      business.name?.charAt(0)?.toUpperCase() || "B"
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-[#242424]">
                      {business.name}
                    </h3>

                    <p className="truncate text-sm text-gray-500">
                      {business.owner?.email || "No owner email"}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[business.status] || statusStyles.pending}`}>
                        {business.status || "pending"}
                      </span>

                      {business.status === "pending" && !business.paystackSubaccountCode && (
                        <span className="rounded-full bg-yellow-50 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-700">
                          ⚠ No payout account
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() => setSelectedBusiness(business)}
                    className="rounded-xl border border-[#E5E2DF] px-5 py-2 font-semibold text-[#242424] transition hover:border-[#B96882] hover:text-[#B96882]"
                  >
                    View Details
                  </button>

                  {business.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(business._id, "approved")}
                        disabled={!business.paystackSubaccountCode}
                        title={!business.paystackSubaccountCode ? "This business must link a payout account before it can be approved." : ""}
                        className="rounded-xl bg-green-500 px-5 py-2 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(business._id, "rejected")}
                        className="rounded-xl bg-[#242424] px-5 py-2 font-semibold text-white transition hover:bg-[#B96882]"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteBusiness(business._id)}
                    className="rounded-xl bg-red-500 px-5 py-2 font-semibold text-white transition hover:bg-red-600"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onApprove={(id) => updateStatus(id, "approved")}
          onReject={(id) => updateStatus(id, "rejected")}
          processing={processing}
        />
      )}

    </div>
  );
}

export default BusinessList;
