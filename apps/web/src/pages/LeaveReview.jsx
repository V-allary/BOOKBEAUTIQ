import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LeaveReview() {
  const { token } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/reviews/token/${token}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Invalid review link."
          );
        }

        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5001/api/reviews/token/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating,
            comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit review."
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F6] px-6 py-12">

        <div className="w-full max-w-lg rounded-[28px] border border-[#E5E2DF] bg-white p-8 shadow-sm sm:p-10">

          {/* LOADING */}

          {loading && (
            <div className="py-8 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E5E2DF] border-t-[#B96882]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading...
              </p>

            </div>
          )}

          {/* ERROR */}

          {!loading && error && !booking && (
            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7EEF1] text-xl font-bold text-[#B96882]">
                !
              </div>

              <p className="mt-5 text-sm leading-6 text-red-500">
                {error}
              </p>

            </div>
          )}

          {/* REVIEW FORM */}

          {!loading && booking && !submitted && (
            <>

              <div className="text-center">

                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#B96882]">
                  Your experience
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#242424]">
                  How was your visit?
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Reviewing:{" "}
                  <span className="font-semibold text-[#242424]">
                    {booking.service}
                  </span>
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
              >

                {/* STAR RATING */}

                <div className="text-center">

                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Rate your experience
                  </p>

                  <div className="flex justify-center gap-2">

                    {[1, 2, 3, 4, 5].map((n) => (

                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                        className={`text-4xl transition duration-200 hover:scale-110 ${
                          n <= rating
                            ? "text-[#B96882]"
                            : "text-[#DDD8D9] hover:text-[#C9859D]"
                        }`}
                      >
                        ★
                      </button>

                    ))}

                  </div>

                  {rating > 0 && (
                    <p className="mt-2 text-sm font-medium text-[#B96882]">
                      {rating === 1 && "We'll do better."}
                      {rating === 2 && "Thanks for your feedback."}
                      {rating === 3 && "Glad you had an okay experience."}
                      {rating === 4 && "We're glad you enjoyed it!"}
                      {rating === 5 && "We're so glad you loved it!"}
                    </p>
                  )}

                </div>

                {/* COMMENT */}

                <div>

                  <label
                    htmlFor="review-comment"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Your review
                  </label>

                  <textarea
                    id="review-comment"
                    placeholder="Tell us about your experience (optional)"
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    rows="4"
                    className="w-full resize-none rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] p-4 text-sm text-[#242424] outline-none transition placeholder:text-gray-400 focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10"
                  />

                </div>

                {/* FORM ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600">
                    {error}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#B96882] py-4 font-semibold text-white transition hover:bg-[#A95772] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Review"}
                </button>

              </form>

            </>
          )}

          {/* SUCCESS */}

          {submitted && (
            <div className="py-4 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F7EEF1] text-3xl font-bold text-[#B96882]">
                ✓
              </div>

              <h1 className="mt-5 text-2xl font-bold text-[#242424]">
                Thank you!
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your review helps other customers find great
                businesses.
              </p>

            </div>
          )}

        </div>

      </main>

      <Footer />
    </>
  );
}

export default LeaveReview;