import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../config";

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;

const inputClass =
  "w-full rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] px-4 py-3.5 text-sm text-[#242424] outline-none transition placeholder:text-[#999] focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10";

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F7F6] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-lg">

        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-block text-2xl font-bold tracking-tight text-[#242424]"
          >
            Book
            <span className="text-[#9D536D]">Beautiq</span>
          </Link>
        </div>

        <div className="rounded-[28px] border border-[#E5E2DF] bg-white p-6 shadow-[0_15px_50px_rgba(30,25,25,0.06)] sm:p-8">
          {children}
        </div>

      </div>
    </div>
  );
}

function Message({ title, body, action }) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold tracking-tight text-[#242424]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-gray-500">{body}</p>
      {action}
    </div>
  );
}

function ReportProblem() {
  const { token } = useParams();

  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/api/reports/context/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "This link isn't valid.");
        }

        setContext(data);
        setAlreadyReported(data.alreadyReported);
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, category, description }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setAlreadyReported(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not send your report.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
      </Shell>
    );
  }

  if (loadError) {
    return (
      <Shell>
        <Message
          title="This link isn't valid"
          body="It may have been copied incorrectly. Please use the link from your booking confirmation email."
          action={
            <Link
              to="/contact"
              className="mt-6 inline-block rounded-xl bg-[#242424] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9D536D]"
            >
              Contact us
            </Link>
          }
        />
      </Shell>
    );
  }

  if (submitted) {
    return (
      <Shell>
        <Message
          title="Thank you"
          body="Your report has been sent to the BookBeautiq team. We've emailed you a confirmation, and we'll be in touch if we need more information."
        />
      </Shell>
    );
  }

  if (alreadyReported) {
    return (
      <Shell>
        <Message
          title="Already reported"
          body="You've already reported this booking. Our team is looking into it. If you have more information, contact us and mention your booking."
          action={
            <Link
              to="/contact"
              className="mt-6 inline-block rounded-xl bg-[#242424] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9D536D]"
            >
              Contact us
            </Link>
          }
        />
      </Shell>
    );
  }

  if (!context.reportable) {
    return (
      <Shell>
        <Message
          title="This booking can't be reported"
          body="Reports can only be made for bookings that were confirmed and paid."
        />
      </Shell>
    );
  }

  const { booking } = context;
  const valid = category && description.trim().length >= MIN_LENGTH;

  return (
    <Shell>

      <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
        Report a problem
      </h1>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Tell us what went wrong. Your report goes to the BookBeautiq team,
        not to the business.
      </p>

      <div className="mt-6 rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-4 text-sm">
        <p className="font-bold text-[#242424]">{booking.businessName}</p>
        <p className="mt-1 text-gray-500">
          {booking.service}
          {booking.staff && booking.staff !== "Not specified"
            ? ` with ${booking.staff}`
            : ""}
        </p>
        <p className="mt-0.5 text-gray-500">
          {booking.date} at {booking.time}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
          >
            What went wrong?
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputClass} cursor-pointer`}
            required
          >
            <option value="">Choose one</option>
            {context.categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {category === "hygiene_or_safety" && (
          <div className="rounded-xl border border-[#E8D4DC] bg-[#F8EEF2] p-4 text-xs leading-5 text-[#7E4057]">
            If you were injured or are in immediate danger, please contact
            local emergency services or a medical professional first.
          </div>
        )}

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
          >
            What happened?
          </label>
          <textarea
            id="description"
            rows={6}
            maxLength={MAX_LENGTH}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please give as much detail as you can, including what was said or done."
            className={inputClass}
            required
          />
          <p className="mt-2 text-xs text-gray-400">
            {description.length}/{MAX_LENGTH}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !valid}
          className="w-full rounded-xl bg-[#242424] py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#9D536D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send report"}
        </button>

      </form>

    </Shell>
  );
}

export default ReportProblem;