import { useEffect, useState } from "react";
import { API_URL } from "../config";

function PlatformReviewForm() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [existing, setExisting] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/platform-reviews/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setEligible(data.eligible);
          setExisting(data.existing);
        }
      } catch (err) {
        console.error("Error checking review eligibility:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/platform-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not submit your review.");
      }

      setMessage(data.message);
      setExisting({ status: "pending", rating, comment });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (!eligible && !existing) {
    return null; // not eligible yet — stay quiet rather than show a dead-end form
  }

  if (existing) {
    const statusCopy = {
      pending: { text: "Your review is awaiting approval.", color: "text-yellow-600" },
      approved: { text: "Your review is live on BookBeautiq. Thank you!", color: "text-green-600" },
      rejected: { text: "Your review wasn't approved for publication.", color: "text-gray-500" },
    };

    const info = statusCopy[existing.status] || statusCopy.pending;

    return (
      <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-5">
        <p className="font-semibold text-[#242424]">Your review of BookBeautiq</p>
        <div className="mt-2 flex gap-1 text-[#B96882]">
          {"★".repeat(existing.rating)}
          <span className="text-gray-300">{"★".repeat(5 - existing.rating)}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">{existing.comment}</p>
        <p className={`mt-3 text-xs font-semibold ${info.color}`}>{info.text}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-5"
    >
      <p className="font-semibold text-[#242424]">Leave a review of BookBeautiq</p>
      <p className="mt-1 text-sm text-gray-500">
        Your feedback helps other people trust the platform. Reviews are checked before they go live.
      </p>

      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl transition"
          >
            <span className={(hoverRating || rating) >= star ? "text-[#B96882]" : "text-gray-300"}>
              ★
            </span>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={500}
        placeholder="What's your experience with BookBeautiq been like?"
        className="mt-4 w-full rounded-xl border border-[#DDDAD7] bg-white p-3.5 text-sm outline-none transition focus:border-[#B96882]"
        required
      />

      <p className="mt-1 text-xs text-gray-400">{comment.length}/500</p>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {message && (
        <p className="mt-2 text-sm text-green-600">{message}</p>
      )}

      <button
        type="submit"
        disabled={submitting || rating === 0 || comment.trim().length < 10}
        className="mt-4 rounded-xl bg-[#242424] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9D536D] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

export default PlatformReviewForm;