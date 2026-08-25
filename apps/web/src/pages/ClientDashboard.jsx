import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";

function ClientDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  // Active dashboard section
  const [activeSection, setActiveSection] = useState("overview");

  // ==========================================
  // FETCH BOOKINGS
  // ==========================================

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/bookings/my-bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setBookings(data);
        }
      } catch (error) {
        console.error("Error loading bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  // ==========================================
  // BOOKING STATUS COLORS
  // ==========================================

  const statusColor = {
    Pending:
      "border-yellow-200 bg-yellow-50 text-yellow-700",

    Confirmed:
      "border-green-200 bg-green-50 text-green-700",

    Completed:
      "border-blue-200 bg-blue-50 text-blue-700",

    Cancelled:
      "border-red-200 bg-red-50 text-red-700",
  };

  // ==========================================
  // BOOKING GROUPS
  // ==========================================

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "Pending" ||
      booking.status === "Confirmed"
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "Completed"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "Cancelled"
  );

  // ==========================================
  // BUSINESSES FROM BOOKINGS
  // ==========================================

  const businesses = [
    ...new Map(
      bookings
        .filter((booking) => booking.businessId?._id)
        .map((booking) => [
          booking.businessId._id,
          booking.businessId,
        ])
    ).values(),
  ];

  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigation = [
    {
      id: "overview",
      label: "Overview",
      icon: "⌂",
    },
    {
      id: "bookings",
      label: "My Bookings",
      icon: "▣",
    },
    {
      id: "messages",
      label: "Messages",
      icon: "✉",
    },
    {
      id: "profile",
      label: "My Profile",
      icon: "♙",
    },
  ];

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F6]">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E7E4E1] border-t-[#242424]" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading your dashboard...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F6]">

      {/* ======================================
          MOBILE TOP BAR
      ====================================== */}

      <div className="sticky top-0 z-40 border-b border-[#E5E2DF] bg-white/95 px-5 py-4 backdrop-blur lg:hidden">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#B96882]">
              BookBeautiq
            </p>

            <p className="mt-0.5 font-bold text-[#242424]">
              {user?.firstName || "Customer"}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setActiveSection("overview")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#242424] font-bold text-white"
          >
            {user?.firstName
              ?.charAt(0)
              ?.toUpperCase() || "C"}
          </button>

        </div>

      </div>

      <div className="mx-auto flex max-w-[1500px]">

        {/* ====================================
            SIDEBAR
        ==================================== */}

        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[#E5E2DF] bg-white px-5 py-8 lg:block">

          {/* BRAND */}

          <div className="px-3">

            <p className="text-xl font-bold tracking-tight text-[#242424]">
              Book
              <span className="text-[#B96882]">
                Beautiq
              </span>
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Customer Portal
            </p>

          </div>

          {/* CUSTOMER CARD */}

          <div className="mt-8 rounded-2xl bg-[#F5F4F2] p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#242424] font-bold text-white">
                {user?.firstName
                  ?.charAt(0)
                  ?.toUpperCase() || "C"}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-[#242424]">
                  {user?.firstName || "Customer"}{" "}
                  {user?.lastName || ""}
                </p>

                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {user?.email || "Customer account"}
                </p>

              </div>

            </div>

          </div>

          {/* NAVIGATION */}

          <nav className="mt-8 space-y-1">

            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Manage
            </p>

            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setActiveSection(item.id)
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  activeSection === item.id
                    ? "bg-[#F2E8EC] text-[#9D536D]"
                    : "text-gray-500 hover:bg-[#F5F4F2] hover:text-[#242424]"
                }`}
              >

                <span className="flex h-8 w-8 items-center justify-center rounded-lg text-base">
                  {item.icon}
                </span>

                <span className="flex-1">
                  {item.label}
                </span>

              </button>
            ))}

          </nav>

          {/* EXPLORE */}

          <div className="mt-8">

            <Link
              to="/explore"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#242424] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#9D536D]"
            >
              <span>✦</span>
              Explore Beauty Services
            </Link>

          </div>

          {/* BOTTOM */}

          <div className="mt-auto pt-10">

            <Link
              to="/"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 transition hover:bg-[#F5F4F2] hover:text-[#242424]"
            >
              <span>←</span>
              Back to BookBeautiq
            </Link>

          </div>

        </aside>

        {/* ====================================
            MAIN CONTENT
        ==================================== */}

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-10">

          {/* ==================================
              MOBILE NAVIGATION
          ================================== */}

          <div className="mb-6 overflow-x-auto lg:hidden">

            <div className="flex min-w-max gap-2">

              {navigation.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setActiveSection(item.id)
                  }
                  className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    activeSection === item.id
                      ? "bg-[#242424] text-white"
                      : "bg-white text-gray-500 shadow-sm"
                  }`}
                >
                  {item.label}
                </button>
              ))}

            </div>

          </div>

          {/* ==================================
              HEADER
          ================================== */}

          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-semibold text-[#9D536D]">
                Customer Dashboard
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">

                {activeSection === "overview"
                  ? `Welcome back, ${
                      user?.firstName || "there"
                    }`
                  : navigation.find(
                      (item) =>
                        item.id === activeSection
                    )?.label}

              </h1>

              <p className="mt-2 text-sm text-gray-500">

                {activeSection === "overview"
                  ? "Keep track of your beauty appointments and discover your next favorite service."
                  : activeSection === "bookings"
                  ? "View and keep track of your beauty appointments."
                  : activeSection === "messages"
                  ? "Chat with businesses you've booked."
                  : "Manage your personal information and account."}

              </p>

            </div>

            {/* DESKTOP EXPLORE BUTTON */}

            <div className="flex items-center gap-3">

              <Link
                to="/explore"
                className="hidden items-center gap-2 rounded-xl bg-[#242424] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9D536D] sm:inline-flex"
              >
                Explore Beauty Services
                <span>→</span>
              </Link>

            </div>

          </div>

          {/* ==================================
              OVERVIEW
          ================================== */}

          {activeSection === "overview" && (
            <div className="space-y-6">

              {/* ==================================
                  STATS
              ================================== */}

              <div className="grid gap-4 sm:grid-cols-3">

                {/* TOTAL */}

                <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-gray-500">
                      Total Bookings
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F1EF] text-[#242424]">
                      ▣
                    </span>

                  </div>

                  <p className="mt-4 text-3xl font-bold text-[#242424]">
                    {bookings.length}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    All your appointments
                  </p>

                </div>

                {/* UPCOMING */}

                <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-gray-500">
                      Upcoming
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                      ◷
                    </span>

                  </div>

                  <p className="mt-4 text-3xl font-bold text-[#242424]">
                    {upcomingBookings.length}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Pending or confirmed
                  </p>

                </div>

                {/* COMPLETED */}

                <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-gray-500">
                      Completed
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      ✓
                    </span>

                  </div>

                  <p className="mt-4 text-3xl font-bold text-[#242424]">
                    {completedBookings.length}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Services completed
                  </p>

                </div>

              </div>

              {/* ==================================
                  QUICK ACTIONS
              ================================== */}

              <div className="grid gap-4 md:grid-cols-3">

                {/* EXPLORE */}

                <Link
                  to="/explore"
                  className="group rounded-2xl border border-[#E5E2DF] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9C3C0] hover:shadow-md"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F1EF] text-xl text-[#242424]">
                      ✦
                    </div>

                    <span className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#9D536D]">
                      →
                    </span>

                  </div>

                  <h2 className="mt-5 text-lg font-bold text-[#242424]">
                    Explore Beauty Services
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Discover salons, spas and beauty professionals.
                  </p>

                </Link>

                {/* PROFILE */}

                <Link
                  to="/profile"
                  className="group rounded-2xl border border-[#E5E2DF] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9C3C0] hover:shadow-md"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F1EF] text-xl text-[#242424]">
                      ♙
                    </div>

                    <span className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#9D536D]">
                      →
                    </span>

                  </div>

                  <h2 className="mt-5 text-lg font-bold text-[#242424]">
                    My Profile
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Manage your personal information and account.
                  </p>

                </Link>

                {/* MESSAGES */}

                <button
                  type="button"
                  onClick={() => {
                    setActiveSection("messages");

                    if (businesses.length > 0) {
                      setSelectedChat(businesses[0]);
                    }
                  }}
                  className="group rounded-2xl border border-[#E5E2DF] bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C9C3C0] hover:shadow-md"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3F1EF] text-xl text-[#242424]">
                      ✉
                    </div>

                    <span className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#9D536D]">
                      →
                    </span>

                  </div>

                  <h2 className="mt-5 text-lg font-bold text-[#242424]">
                    Messages
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Chat with businesses you've booked.
                  </p>

                </button>

              </div>

              {/* ==================================
                  MAIN TWO COLUMN AREA
              ================================== */}

              <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">

                {/* UPCOMING BOOKINGS */}

                <div className="rounded-2xl border border-[#E5E2DF] bg-white shadow-sm">

                  <div className="flex items-center justify-between border-b border-[#E5E2DF] px-6 py-5">

                    <div>

                      <h2 className="font-bold text-[#242424]">
                        Upcoming Bookings
                      </h2>

                      <p className="mt-1 text-xs text-gray-400">
                        Your latest appointments
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveSection("bookings")
                      }
                      className="text-sm font-semibold text-[#9D536D] hover:underline"
                    >
                      View all
                    </button>

                  </div>

                  <div className="p-5">

                    {upcomingBookings.length === 0 ? (

                      <div className="py-10 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F4F2]">
                          ▣
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[#242424]">
                          No upcoming bookings
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Find a beauty service for your next appointment.
                        </p>

                        <Link
                          to="/explore"
                          className="mt-5 inline-flex rounded-xl bg-[#242424] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9D536D]"
                        >
                          Explore Services
                        </Link>

                      </div>

                    ) : (

                      <div className="space-y-3">

                        {upcomingBookings
                          .slice(0, 4)
                          .map((b) => (
                            <div
                              key={b._id}
                              className="flex flex-col gap-4 rounded-xl border border-[#E5E2DF] p-4 transition hover:border-[#C9C3C0] sm:flex-row sm:items-center sm:justify-between"
                            >

                              <div className="min-w-0">

                                <p className="font-semibold text-[#242424]">
                                  {b.businessId?.name ||
                                    "Beauty Professional"}
                                </p>

                                <p className="mt-1 truncate text-sm text-gray-500">
                                  {b.service} with{" "}
                                  {b.staff}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {b.date} at {b.time}
                                </p>

                              </div>

                              <span
                                className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                                  statusColor[
                                    b.status
                                  ] ||
                                  "border-gray-200 bg-gray-50 text-gray-600"
                                }`}
                              >
                                {b.status}
                              </span>

                            </div>
                          ))}

                      </div>

                    )}

                  </div>

                </div>

                {/* QUICK DISCOVER */}

                <div className="rounded-2xl border border-[#E5E2DF] bg-white p-6 shadow-sm">

                  <h2 className="font-bold text-[#242424]">
                    Discover More
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Find your next beauty experience.
                  </p>

                  <div className="mt-5 space-y-3">

                    <Link
                      to="/explore"
                      className="flex w-full items-center gap-4 rounded-xl border border-[#E5E2DF] p-4 text-left transition hover:border-[#C9C3C0] hover:bg-[#F8F7F6]"
                    >

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F1EF] text-[#242424]">
                        ✦
                      </span>

                      <div>

                        <p className="text-sm font-semibold text-[#242424]">
                          Find a Beauty Service
                        </p>

                        <p className="text-xs text-gray-400">
                          Browse businesses near you
                        </p>

                      </div>

                    </Link>

                    <Link
                      to="/profile"
                      className="flex w-full items-center gap-4 rounded-xl border border-[#E5E2DF] p-4 text-left transition hover:border-[#C9C3C0] hover:bg-[#F8F7F6]"
                    >

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F1EF] text-[#242424]">
                        ♙
                      </span>

                      <div>

                        <p className="text-sm font-semibold text-[#242424]">
                          Update My Profile
                        </p>

                        <p className="text-xs text-gray-400">
                          Keep your account information updated
                        </p>

                      </div>

                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection("messages");

                        if (businesses.length > 0) {
                          setSelectedChat(businesses[0]);
                        }
                      }}
                      className="flex w-full items-center gap-4 rounded-xl border border-[#E5E2DF] p-4 text-left transition hover:border-[#C9C3C0] hover:bg-[#F8F7F6]"
                    >

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F1EF] text-[#242424]">
                        ✉
                      </span>

                      <div>

                        <p className="text-sm font-semibold text-[#242424]">
                          Message a Business
                        </p>

                        <p className="text-xs text-gray-400">
                          Continue your conversations
                        </p>

                      </div>

                    </button>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================================
              BOOKINGS
          ================================== */}

          {activeSection === "bookings" && (
            <div className="rounded-2xl border border-[#E5E2DF] bg-white shadow-sm">

              <div className="border-b border-[#E5E2DF] px-6 py-5">

                <h2 className="font-bold text-[#242424]">
                  My Bookings
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  View and keep track of your beauty appointments.
                </p>

              </div>

              <div className="p-5">

                {bookings.length === 0 ? (

                  <div className="py-12 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F1EF] text-xl">
                      ▣
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[#242424]">
                      No bookings yet
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Your appointments will appear here.
                    </p>

                    <Link
                      to="/explore"
                      className="mt-5 inline-flex rounded-xl bg-[#242424] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9D536D]"
                    >
                      Explore Beauty Services
                    </Link>

                  </div>

                ) : (

                  <div className="space-y-3">

                    {bookings.map((b) => (
                      <div
                        key={b._id}
                        className="rounded-xl border border-[#E5E2DF] p-5 transition hover:border-[#C9C3C0]"
                      >

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div>

                            <h3 className="font-bold text-[#242424]">
                              {b.businessId?.name ||
                                "Beauty Professional"}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {b.service} with{" "}
                              {b.staff}
                            </p>

                            <p className="mt-1 text-sm text-gray-400">
                              {b.date} at {b.time}
                            </p>

                          </div>

                          <span
                            className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                              statusColor[
                                b.status
                              ] ||
                              "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                          >
                            {b.status}
                          </span>

                        </div>

                      </div>
                    ))}

                  </div>

                )}

              </div>

            </div>
          )}

          {/* ==================================
              MESSAGES
          ================================== */}

          {activeSection === "messages" && (
            <div className="rounded-2xl border border-[#E5E2DF] bg-white shadow-sm">

              <div className="border-b border-[#E5E2DF] px-6 py-5">

                <h2 className="font-bold text-[#242424]">
                  Customer Messages
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Chat with businesses you've booked.
                </p>

              </div>

              <div className="grid min-h-[550px] lg:grid-cols-[280px_1fr]">

                {/* CONVERSATIONS */}

                <div className="border-b border-[#E5E2DF] p-4 lg:border-b-0 lg:border-r">

                  <p className="px-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Businesses
                  </p>

                  <div className="mt-3 space-y-1">

                    {businesses.length === 0 ? (

                      <p className="px-2 py-6 text-sm text-gray-400">
                        No conversations yet.
                      </p>

                    ) : (

                      businesses.map((business) => (
                        <button
                          key={business._id}
                          type="button"
                          onClick={() =>
                            setSelectedChat(
                              business
                            )
                          }
                          className={`w-full rounded-xl px-3 py-3 text-left transition ${
                            selectedChat?._id ===
                            business._id
                              ? "bg-[#F2E8EC]"
                              : "hover:bg-[#F5F4F2]"
                          }`}
                        >

                          <p
                            className={`truncate text-sm font-semibold ${
                              selectedChat?._id ===
                              business._id
                                ? "text-[#9D536D]"
                                : "text-[#242424]"
                            }`}
                          >
                            {business.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            Beauty business
                          </p>

                        </button>
                      ))

                    )}

                  </div>

                </div>

                {/* CHAT */}

                <div className="p-5">

                  {selectedChat ? (

                    <ChatWidget
                      businessId={selectedChat._id}
                      customerEmail={user?.email}
                    />

                  ) : (

                    <div className="flex h-full min-h-[400px] items-center justify-center text-center">

                      <div>

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2E8EC] text-xl text-[#9D536D]">
                          ✉
                        </div>

                        <h3 className="mt-4 font-semibold text-[#242424]">
                          Select a conversation
                        </h3>

                        <p className="mt-1 text-sm text-gray-400">
                          Choose a business to start chatting.
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              </div>

            </div>
          )}

          {/* ==================================
              PROFILE
          ================================== */}

          {activeSection === "profile" && (
            <div className="max-w-3xl">

              <div className="rounded-2xl border border-[#E5E2DF] bg-white shadow-sm">

                <div className="border-b border-[#E5E2DF] px-6 py-5">

                  <h2 className="font-bold text-[#242424]">
                    My Profile
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Manage your personal account information.
                  </p>

                </div>

                <div className="p-6 sm:p-8">

                  <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#242424] text-2xl font-bold text-white">
                      {user?.firstName
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                    </div>

                    <div>

                      <h3 className="text-xl font-bold text-[#242424]">
                        {user?.firstName || ""}{" "}
                        {user?.lastName || ""}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {user?.email || ""}
                      </p>

                      {user?.phone && (
                        <p className="mt-1 text-sm text-gray-400">
                          {user.phone}
                        </p>
                      )}

                    </div>

                  </div>

                  <div className="mt-8 border-t border-[#ECE9E6] pt-8">

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div className="rounded-xl bg-[#F7F6F5] p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          First Name
                        </p>

                        <p className="mt-1 font-semibold text-[#242424]">
                          {user?.firstName || "—"}
                        </p>

                      </div>

                      <div className="rounded-xl bg-[#F7F6F5] p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Last Name
                        </p>

                        <p className="mt-1 font-semibold text-[#242424]">
                          {user?.lastName || "—"}
                        </p>

                      </div>

                      <div className="rounded-xl bg-[#F7F6F5] p-4 sm:col-span-2">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Email
                        </p>

                        <p className="mt-1 font-semibold text-[#242424]">
                          {user?.email || "—"}
                        </p>

                      </div>

                      <div className="rounded-xl bg-[#F7F6F5] p-4 sm:col-span-2">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Phone
                        </p>

                        <p className="mt-1 font-semibold text-[#242424]">
                          {user?.phone || "Not provided"}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-[#FAF9F8] p-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F1EF] text-[#242424]">
                        ✦
                      </div>

                      <div>

                        <p className="font-semibold text-[#242424]">
                          Looking for your next appointment?
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          Explore beauty businesses and find a service that works for you.
                        </p>

                        <Link
                          to="/explore"
                          className="mt-4 inline-flex rounded-xl bg-[#242424] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9D536D]"
                        >
                          Explore Beauty Services
                        </Link>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}

export default ClientDashboard;