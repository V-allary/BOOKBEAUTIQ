import { useEffect, useState } from "react";
import { API_URL } from "../../config";

const TABS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function PlatformReviewManager() {
  const token = localStorage.getItem("token");

  const [statusFilter, setStatusFilter] = useState("pending");
  const [reviews, setReviews] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/platform-reviews?status=${statusFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok) {
        setReviews(data.reviews);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error("Error loading platform reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleAction = async (id, status) => {
    setActingId(id);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/platform-reviews/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Action failed.");

      fetchReviews();
    } catch (error) {
      alert(error.message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              statusFilter === tab.id
                ? "bg-[#242424] text-white"
                : "border border-[#E5E2DF] bg-white text-gray-600 hover:border-[#B96882] hover:text-[#B96882]"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-70">{counts[tab.id] || 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading...</p>
      ) : reviews.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-[#DDD5DD] p-8 text-center">
          <p className="font-semibold">Nothing here</p>
          <p className="mt-1 text-sm text-[#918A92]">
            No {statusFilter} reviews right now.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-2xl border border-[#EAE4EA] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-[#242424]">{review.displayName}</p>
                  <p className="text-xs text-gray-400">
                    {review.userId?.email} · {review.role === "business" ? "Business owner" : "Customer"}
                  </p>
                </div>
                <div className="flex gap-1 text-[#B96882]">
                  {"★".repeat(review.rating)}
                  <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600">{review.comment}</p>

              {statusFilter === "pending" && (
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleAction(review._id, "approved")}
                    disabled={actingId === review._id}
                    className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(review._id, "rejected")}
                    disabled={actingId === review._id}
                    className="rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default PlatformReviewManager;