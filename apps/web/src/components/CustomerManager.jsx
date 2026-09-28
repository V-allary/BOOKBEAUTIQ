import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "../../config";

const PAGE_SIZE = 25;

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

function AccountBadge({ status }) {
  const suspended = status === "suspended";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
        suspended
          ? "bg-[#FFF0EF] text-[#D94A45]"
          : "bg-[#EDF8F0] text-[#3F8757]"
      }`}
    >
      {suspended ? "Suspended" : "Active"}
    </span>
  );
}

function CustomerManager() {
  const token = localStorage.getItem("token");

  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const latestRequest = useRef(0);

  // ==========================================
  // LIST
  // ==========================================

  const fetchCustomers = useCallback(
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
        if (debouncedSearch) params.set("search", debouncedSearch);

        const response = await fetch(
          `${API_URL}/api/admin/customers?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        // A newer search has started; ignore this stale response
        if (requestId !== latestRequest.current) return;

        if (!response.ok) {
          throw new Error(data.message || "Failed to load customers.");
        }

        setCustomers((current) =>
          replace ? data.customers : [...current, ...data.customers]
        );
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
    [debouncedSearch, statusFilter, token]
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCustomers(1, true);
  }, [fetchCustomers]);

  // ==========================================
  // DETAIL
  // ==========================================

  const openCustomer = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setShowSuspendForm(false);
    setReason("");
    setActionMessage("");
    setActionError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load customer.");
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
  // SUSPEND / REINSTATE
  // ==========================================

  const runAction = async (path, body) => {
    setActing(true);
    setActionMessage("");
    setActionError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/customers/${selectedId}/${path}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body || {}),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Action failed.");
      }

      const updated = data.customer;

      setDetail((current) =>
        current
          ? { ...current, customer: { ...current.customer, ...updated } }
          : current
      );
      setCustomers((list) =>
        list.map((c) => (c._id === updated._id ? { ...c, ...updated } : c))
      );

      setActionMessage(data.message);
      setShowSuspendForm(false);
      setReason("");
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActing(false);
    }
  };

  const handleReinstate = () => {
    if (!window.confirm("Reinstate this customer? They'll be able to sign in and book again.")) {
      return;
    }
    runAction("reinstate");
  };

  const customer = detail?.customer;
  const suspended = customer?.accountStatus === "suspended";

  const statCards = detail
    ? [
        { label: "Bookings", value: detail.stats.total },
        { label: "Completed", value: detail.stats.completed },
        { label: "Cancelled", value: detail.stats.cancelled },
        { label: "No-shows", value: detail.stats.noShows, alert: detail.stats.noShows > 0 },
      ]
    : [];

  return (
    <div>

      {/* CONTROLS */}

      <div className="flex flex-col gap-3 sm:flex-row">

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone"
          className={inputClass}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClass} cursor-pointer sm:w-48`}
        >
          <option value="all">All customers</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

      </div>

      <p className="mt-3 text-xs text-[#918A92]">
        {loading ? "Loading..." : `${total} customer${total === 1 ? "" : "s"}`}
      </p>

      {listError && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {listError}
        </div>
      )}

      {/* LIST */}

      {!loading && customers.length === 0 && !listError ? (
        <div className="mt-5 rounded-xl border border-dashed border-[#DDD5DD] p-8 text-center">
          <p className="font-semibold">No customers found</p>
          <p className="mt-1 text-sm text-[#918A92]">
            Try a different search or filter.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[#EEE9EF]">

          {customers.map((c) => (
            <div
              key={c._id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F1F5] text-sm font-bold text-[#77717A]">
                  {c.firstName?.charAt(0)?.toUpperCase() || "C"}
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold">
                      {c.firstName} {c.lastName}
                    </p>
                    <AccountBadge status={c.accountStatus} />
                  </div>

                  <p className="truncate text-xs text-[#918A92]">
                    {c.email}
                    {c.phone ? ` · ${c.phone}` : ""}
                  </p>

                  <p className="mt-0.5 text-xs text-[#918A92]">
                    Joined {formatDate(c.createdAt)} · {c.stats.total} booking
                    {c.stats.total === 1 ? "" : "s"}
                    {c.stats.noShows > 0 && (
                      <span className="font-semibold text-[#D94A45]">
                        {" "}· {c.stats.noShows} no-show
                        {c.stats.noShows === 1 ? "" : "s"}
                      </span>
                    )}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => openCustomer(c._id)}
                className="shrink-0 rounded-xl border border-[#E5E2DF] px-4 py-2 text-sm font-semibold text-[#242424] transition hover:border-[#B96882] hover:text-[#B96882]"
              >
                View Details
              </button>

            </div>
          ))}

        </div>
      )}

      {page < pages && !loading && (
        <button
          type="button"
          onClick={() => fetchCustomers(page + 1, false)}
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
                  {customer
                    ? `${customer.firstName} ${customer.lastName}`
                    : "Customer"}
                </h2>
                {customer && (
                  <div className="mt-1">
                    <AccountBadge status={customer.accountStatus} />
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

              {detail && customer && (
                <div className="space-y-5">

                  {/* CONTACT */}

                  <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B96882]">
                      Contact
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="mt-0.5 break-all font-semibold text-[#242424]">
                          {customer.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="mt-0.5 font-semibold text-[#242424]">
                          {customer.phone || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Joined</p>
                        <p className="mt-0.5 font-semibold text-[#242424]">
                          {formatDate(customer.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Email verified</p>
                        <p className="mt-0.5 font-semibold text-[#242424]">
                          {customer.isEmailVerified ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* STATS */}

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {statCards.map((card) => (
                      <div
                        key={card.label}
                        className="rounded-2xl border border-[#E5E2DF] bg-white p-4"
                      >
                        <p className="text-xs text-gray-400">{card.label}</p>
                        <p
                          className={`mt-1 text-2xl font-bold ${
                            card.alert ? "text-[#D94A45]" : "text-[#242424]"
                          }`}
                        >
                          {card.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* SUSPENSION INFO */}

                  {suspended && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#D94A45]">
                        Suspended {formatDate(customer.suspendedAt)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#7A2E2B]">
                        {customer.suspendedReason || "No reason recorded."}
                      </p>
                    </div>
                  )}

                  {/* BOOKINGS */}

                  <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B96882]">
                      Booking history
                    </p>

                    {detail.bookings.length === 0 ? (
                      <p className="text-sm text-gray-400">No bookings yet.</p>
                    ) : (
                      <div className="divide-y divide-[#EEE9EF]">
                        {detail.bookings.map((b) => (
                          <div
                            key={b._id}
                            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#242424]">
                                {b.businessId?.name || "Deleted business"}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                {b.service} · {b.date} at {b.time}
                              </p>
                            </div>
                            <span
                              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                bookingStatusStyles[b.status] ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MESSAGES */}

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

                  {/* ACTIONS */}

                  {suspended ? (
                    <button
                      type="button"
                      onClick={handleReinstate}
                      disabled={acting}
                      className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
                    >
                      {acting ? "Working..." : "Reinstate customer"}
                    </button>
                  ) : showSuspendForm ? (
                    <div className="rounded-2xl border border-[#E5E2DF] p-5">
                      <label className="mb-2 block text-sm font-semibold text-[#242424]">
                        Reason for suspension
                      </label>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Missed 3 confirmed appointments without notice"
                        className={inputClass}
                      />
                      <p className="mt-2 text-xs text-gray-400">
                        The customer is emailed this reason and loses access
                        immediately. {reason.length}/500
                      </p>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => runAction("suspend", { reason })}
                          disabled={acting || reason.trim().length < 5}
                          className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {acting ? "Suspending..." : "Confirm suspension"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSuspendForm(false);
                            setReason("");
                          }}
                          className="rounded-xl border border-[#E5E2DF] px-5 py-3 text-sm font-semibold text-[#242424] transition hover:bg-[#F5F4F2]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSuspendForm(true)}
                      className="w-full rounded-xl border border-red-200 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Suspend customer
                    </button>
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

export default CustomerManager;