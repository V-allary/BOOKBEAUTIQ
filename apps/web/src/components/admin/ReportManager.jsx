import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "../../config";

const PAGE_SIZE = 25;

const TABS = [
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "dismissed", label: "Dismissed" },
  { id: "all", label: "All" },
];

const reportStatusStyles = {
  open: "bg-[#FFF7E9] text-[#B77719]",
  resolved: "bg-[#EDF8F0] text-[#3F8757]",
  dismissed: "bg-gray-200 text-gray-700",
};

const bookingStatusStyles = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
  "No-show": "bg-gray-200 text-gray-700",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const inputClass =
  "w-full rounded-xl border border-[#E9E3E9] bg-[#FCFAFD] px-4 py-3 text-sm text-[#171717] outline-none transition placeholder:text-[#99939A] focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10";

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
        reportStatusStyles[status] || reportStatusStyles.open
      }`}
    >
      {status}
    </span>
  );
}

function ReportManager() {
  const token = localStorage.getItem("token");

  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({ open: 0, resolved: 0, dismissed: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("open");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const latestRequest = useRef(0);

  // ==========================================
  // LIST
  // ==========================================

  const fetchReports = useCallback(
    async (pageToLoad, replace) => {
      const requestId = ++latestRequest.current;

      if (replace) setLoading(true);
      else setLoadingMore(true);
      setListError("");

      try {
        const params = new URLSearchParams({
          page: pageToLoad,
          limit: PAGE_SIZE,
          status: statusFilter,
        });

        const response = await fetch(
          `${API_URL}/api/admin/reports?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        // A newer request has started; ignore this stale response
        if (requestId !== latestRequest.current) return;

        if (!response.ok) {
          throw new Error(data.message || "Failed to load reports.");
        }

        setReports((current) =>
          replace ? data.reports : [...current, ...data.reports]
        );
        setCounts(data.counts);
        setTotal(data.total);
        setPage(data.page);
        setPages(data.pages);
      } catch (error) {
        if (requestId === latestRequest.current) setListError(error.message);
      } finally {
        if (requestId === latestRequest.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [statusFilter, token]
  );

  useEffect(() => {
    fetchReports(1, true);
  }, [fetchReports]);

  // ==========================================
  // DETAIL
  // ==========================================

  const openReport = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setNote("");
    setActionMessage("");
    setActionError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load report.");
      }

      setDetail(data);
    } catch (error) {
      setDetailError(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  // ==========================================
  // RESOLVE / DISMISS
  // ==========================================

  const closeReport = async (status) => {
    if (
      !window.confirm(
        `Mark this report as ${status}? The reporter will be sent a short email.`
      )
    ) {
      return;
    }

    setActing(true);
    setActionMessage("");
    setActionError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/reports/${selectedId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, note }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Action failed.");
      }

      setDetail((current) =>
        current
          ? { ...current, report: { ...current.report, ...data.report } }
          : current
      );
      setActionMessage(data.message);
      setNote("");
      fetchReports(1, true);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActing(false);
    }
  };

  const report = detail?.report;
  const booking = report?.bookingId;
  const business = report?.businessId;

  return (
    <div>

      {/* TABS */}

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
            {tab.id !== "all" && (
              <span className="ml-2 text-xs opacity-70">
                {counts[tab.id] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {listError && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {listError}
        </div>
      )}

      {/* LIST */}

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading...</p>
      ) : reports.length === 0 && !listError ? (
        <div className="mt-5 rounded-xl border border-dashed border-[#DDD5DD] p-8 text-center">
          <p className="font-semibold">
            {statusFilter === "open" ? "No open reports" : "No reports here"}
          </p>
          <p className="mt-1 text-sm text-[#918A92]">
            {statusFilter === "open"
              ? "New reports from customers will appear here."
              : "Nothing to show for this filter."}
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[#EEE9EF]">

          {reports.map((r) => {
            const repeat = r.businessStats.total >= 3 || r.businessStats.open >= 2;

            return (
              <div
                key={r._id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold">{r.categoryLabel}</p>
                    <StatusBadge status={r.status} />
                  </div>

                  <p className="mt-1 truncate text-sm text-[#5B555C]">
                    {r.businessId?.name || "Deleted business"}
                  </p>

                  <p className="mt-0.5 line-clamp-2 text-xs text-[#918A92]">
                    {r.description}
                  </p>

                  <p className="mt-1 text-xs text-[#918A92]">
                    {formatDate(r.createdAt)}
                    {r.bookingId?.customerName
                      ? ` · from ${r.bookingId.customerName}`
                      : ""}
                    {r.businessStats.total > 0 && (
                      <span
                        className={
                          repeat ? "font-semibold text-[#D94A45]" : ""
                        }
                      >
                        {" "}· {r.businessStats.total} report
                        {r.businessStats.total === 1 ? "" : "s"} on this business
                      </span>
                    )}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => openReport(r._id)}
                  className="shrink-0 rounded-xl border border-[#E5E2DF] px-4 py-2 text-sm font-semibold text-[#242424] transition hover:border-[#B96882] hover:text-[#B96882]"
                >
                  View
                </button>

              </div>
            );
          })}

        </div>
      )}

      {!loading && total > 0 && (
        <p className="mt-3 text-xs text-[#918A92]">
          Showing {reports.length} of {total}
        </p>
      )}

      {page < pages && !loading && (
        <button
          type="button"
          onClick={() => fetchReports(page + 1, false)}
          disabled={loadingMore}
          className="mt-4 w-full rounded-xl border border-[#E5E2DF] py-3 text-sm font-semibold text-[#242424] transition hover:border-[#B96882] hover:text-[#B96882] disabled:opacity-60"
        >
          {loadingMore ? "Loading..." : "Load more"}
        </button>
      )}

      {/* DETAIL MODAL */}

      {selectedId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeDetail}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-start justify-between gap-4 border-b border-[#E5E2DF] px-6 py-5 sm:px-8">

              <div>
                <h2 className="text-xl font-bold text-[#242424]">
                  {report?.categoryLabel || "Report"}
                </h2>
                {report && (
                  <div className="mt-1">
                    <StatusBadge status={report.status} />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={closeDetail}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F4F2] text-lg text-[#555] transition hover:bg-[#F2E8EC] hover:text-[#9D536D]"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <div className="max-h-[calc(90vh-100px)] overflow-y-auto px-6 py-6 sm:px-8">

              {detailLoading && (
                <p className="py-10 text-center text-sm text-gray-500">Loading...</p>
              )}

              {detailError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                  {detailError}
                </div>
              )}

              {detail && report && (
                <div className="space-y-5">

                  {/* WHAT WAS REPORTED */}

                  <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#B96882]">
                      Report · {formatDate(report.createdAt)}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {report.description}
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    {/* REPORTER + BOOKING */}

                    <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B96882]">
                        Reporter
                      </p>
                      {booking ? (
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold text-[#242424]">
                            {booking.customerName}
                          </p>
                          <p className="break-all text-gray-500">{booking.customerEmail}</p>
                          <p className="text-gray-500">{booking.customerPhone}</p>
                          <div className="border-t border-[#EEE9EF] pt-2">
                            <p className="text-gray-700">
                              {booking.service}
                              {booking.staff && booking.staff !== "Not specified"
                                ? ` with ${booking.staff}`
                                : ""}
                            </p>
                            <p className="text-gray-500">
                              {booking.date} at {booking.time}
                            </p>
                            <p className="mt-1 text-gray-500">
                              Deposit KES {booking.depositAmount}
                            </p>
                            <span
                              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                bookingStatusStyles[booking.status] ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              Booking {booking.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Booking no longer exists.</p>
                      )}
                    </div>

                    {/* BUSINESS */}

                    <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B96882]">
                        Business
                      </p>
                      {business ? (
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold text-[#242424]">{business.name}</p>
                          <p className="text-gray-500">{business.location}</p>
                          <p className="text-gray-500">{business.phone || "No phone"}</p>
                          <p className="break-all text-gray-500">
                            {business.email || "No email"}
                          </p>
                          <p className="text-xs capitalize text-gray-400">
                            Listing: {business.status}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Business no longer exists.</p>
                      )}
                    </div>

                  </div>

                  {/* HISTORY */}

                  <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B96882]">
                      Other reports on this business
                    </p>

                    {detail.history.length === 0 ? (
                      <p className="text-sm text-gray-400">None. This is the only report.</p>
                    ) : (
                      <div className="divide-y divide-[#EEE9EF]">
                        {detail.history.map((h) => (
                          <div
                            key={h._id}
                            className="flex items-center justify-between gap-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm text-[#242424]">
                                {h.categoryLabel}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(h.createdAt)}
                              </p>
                            </div>
                            <StatusBadge status={h.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {actionMessage && (
                    <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
                      {actionMessage}
                    </div>
                  )}

                  {actionError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                      {actionError}
                    </div>
                  )}

                  {/* OUTCOME / ACTIONS */}

                  {report.status === "open" ? (
                    <div className="rounded-2xl border border-[#E5E2DF] p-5">
                      <label className="mb-2 block text-sm font-semibold text-[#242424]">
                        Internal note
                      </label>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What did you find, and what did you do about it?"
                        className={inputClass}
                      />
                      <p className="mt-2 text-xs text-gray-400">
                        Only admins see this note. The reporter gets a short,
                        generic email either way. Resolved means you acted on it;
                        dismissed means no breach was found. {note.length}/500
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => closeReport("resolved")}
                          disabled={acting || note.trim().length < 5}
                          className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {acting ? "Working..." : "Mark resolved"}
                        </button>
                        <button
                          type="button"
                          onClick={() => closeReport("dismissed")}
                          disabled={acting || note.trim().length < 5}
                          className="flex-1 rounded-xl border border-[#E5E2DF] py-3 text-sm font-bold text-[#242424] transition hover:bg-[#F5F4F2] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#B96882]">
                        {report.status} {formatDate(report.resolvedAt)}
                        {report.resolvedBy?.firstName
                          ? ` by ${report.resolvedBy.firstName}`
                          : ""}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {report.adminNote || "No note recorded."}
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ReportManager;