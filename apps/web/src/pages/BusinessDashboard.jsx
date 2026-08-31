import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceManager from "../components/admin/ServiceManager";
import StaffManager from "../components/admin/StaffManager";
import BusinessChatWidget from "../components/BusinessChatWidget";
import SubscriptionCard from "../components/SubscriptionCard";


function BusinessDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const getImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("/uploads/") ? `http://localhost:5001${path}` : path;
  };
  

  const [business, setBusiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);


  // Active dashboard section
  const [activeSection, setActiveSection] = useState("overview");

  // ==========================================
  // BUSINESS PROFILE STATE
  // ==========================================

  const [profileForm, setProfileForm] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    price: "",
    phone: "",
    email: "",
    openingHours: "",
    instagramUrl: "",
    tiktokUrl: "",
  });


  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // ==========================================
  // PAYOUT FORM STATE
  // ==========================================

  const [banks, setBanks] = useState([]);

  const [payoutForm, setPayoutForm] = useState({
    bankCode: "",
    accountNumber: "",
  });

  const [resolvedName, setResolvedName] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState("");

  // ==========================================
  // FETCH CONVERSATIONS
  // ==========================================

  const fetchConversations = async (businessId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/messages/business/${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setConversations(data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // ==========================================
  // FETCH BUSINESS
  // ==========================================

  const fetchBusiness = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/businesses/owner",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBusiness(data);
      }
    } catch (error) {
      console.error("Error loading business:", error);
    }
  };

  // ==========================================
  // FETCH BOOKINGS
  // ==========================================

  const fetchBookings = async (businessId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/bookings/business/${businessId}`,
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
    }
  };

  // ==========================================
  // FETCH BANKS
  // ==========================================

  const fetchBanks = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/payouts/banks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBanks(data);
      }
    } catch (error) {
      console.error("Error loading banks:", error);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const init = async () => {
      await fetchBusiness();
      await fetchBanks();
      setLoading(false);
    };

    init();
  }, []);

  // ==========================================
  // LOAD BUSINESS DATA
  // ==========================================

  useEffect(() => {
    if (business?._id) {
      fetchBookings(business._id);
      fetchConversations(business._id);
    }
  }, [business]);

  // ==========================================
  // LOAD PROFILE DATA INTO FORM
  // ==========================================

  useEffect(() => {
    if (!business) return;
    setProfileForm({
      name: business.name || "",
      category: business.category || "",
      location: business.location || "",
      description: business.description || "",
      price: business.price || "",
      phone: business.phone || "",
      email: business.email || "",
      openingHours: business.openingHours || "",
      instagramUrl: business.instagramUrl || "",
      tiktokUrl: business.tiktokUrl || "",
    });

    setCoverPreview(business.image ? getImageUrl(business.image) : "");

    setGalleryPreviews(
      Array.isArray(business.gallery)
        ? business.gallery.map(getImageUrl)
        : []
    );
    
    

    setGalleryFiles([]);
    setCoverFile(null);
    setProfileMessage("");
  }, [business]);

  // ==========================================
  // MARK BOOKING COMPLETED
  // ==========================================

  const handleMarkCompleted = async (bookingId) => {
    try {
      setProcessingId(bookingId);

      const response = await fetch(
        `http://localhost:5001/api/bookings/${bookingId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark completed."
        );
      }

      alert(
        "Marked completed — a review request has been emailed to the customer."
      );

      await fetchBookings(business._id);
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const businessLink = `${window.location.origin}/business/${business?._id}`;

const handleCopyLink = () => {
  navigator.clipboard.writeText(businessLink);
  setLinkCopied(true);
  setTimeout(() => setLinkCopied(false), 2000);
};


  // ==========================================
  // UPLOAD IMAGE
  // ==========================================

  const uploadImage = async (file) => {
    const imageData = new FormData();

    imageData.append("image", file);

    const response = await fetch(
      "http://localhost:5001/api/uploads",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Image upload failed."
      );
    }

    return data.imageUrl;
  };

  // ==========================================
  // COVER IMAGE CHANGE
  // ==========================================

  const handleDashboardCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileMessage(
        "Please select a valid image."
      );
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setProfileMessage("");

    e.target.value = "";
  };

  // ==========================================
  // GALLERY IMAGE CHANGE
  // MAXIMUM 5 TOTAL
  // ==========================================

  const handleDashboardGalleryChange = (e) => {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length === 0) {
      setProfileMessage(
        "Please select valid image files."
      );

      e.target.value = "";
      return;
    }

    const existingGallery = Array.isArray(
      business?.gallery
    )
      ? business.gallery.map(getImageUrl)
      : [];

    const availableSlots =
      5 -
      existingGallery.length -
      galleryFiles.length;

    if (availableSlots <= 0) {
      setProfileMessage(
        "You can have a maximum of 5 gallery images."
      );

      e.target.value = "";
      return;
    }

    const filesToAdd = validFiles.slice(
      0,
      availableSlots
    );

    const combinedFiles = [
      ...galleryFiles,
      ...filesToAdd,
    ];

    setGalleryFiles(combinedFiles);

    setGalleryPreviews([
      ...existingGallery,
      ...combinedFiles.map((file) =>
        URL.createObjectURL(file)
      ),
    ]);

    setProfileMessage("");

    e.target.value = "";
  };

  // ==========================================
  // REMOVE NEW GALLERY IMAGE
  // ==========================================

  const removeNewGalleryImage = (index) => {
    const existingGallery = Array.isArray(
      business?.gallery
    )
      ? business.gallery.map(getImageUrl)
      : [];

    const newFileIndex =
      index - existingGallery.length;

    if (newFileIndex < 0) {
      setProfileMessage(
        "Existing gallery images cannot be removed yet."
      );
      return;
    }

    const updatedFiles = galleryFiles.filter(
      (_, i) => i !== newFileIndex
    );

    setGalleryFiles(updatedFiles);

    setGalleryPreviews([
      ...existingGallery,
      ...updatedFiles.map((file) =>
        URL.createObjectURL(file)
      ),
    ]);

    setProfileMessage("");
  };

  // ==========================================
  // SAVE BUSINESS PROFILE
  // ==========================================

  const handleSaveBusinessProfile = async () => {
    setProfileSaving(true);
    setProfileMessage("");

    try {
      let coverUrl = business.image || "";

      // Upload new cover if selected
      if (coverFile) {
        coverUrl = await uploadImage(coverFile);
      }

      // Existing gallery
      const existingGallery = Array.isArray(
        business.gallery
      )
        ? business.gallery
        : [];

      // Upload new gallery images
      const newGalleryUrls = [];

      for (const file of galleryFiles) {
        const url = await uploadImage(file);
        newGalleryUrls.push(url);
      }

      const updatedGallery = [
        ...existingGallery,
        ...newGalleryUrls,
      ].slice(0, 5);

      const response = await fetch(
        `http://localhost:5001/api/businesses/${business._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...profileForm,
            image: coverUrl,
            gallery: updatedGallery,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update business profile."
        );
      }

      await fetchBusiness();

      setCoverFile(null);
      setGalleryFiles([]);

      setProfileMessage(
        "Business profile updated successfully."
      );

    } catch (error) {
      setProfileMessage(error.message);
    } finally {
      setProfileSaving(false);
    }
  };

  // ==========================================
  // VERIFY PAYOUT ACCOUNT
  // ==========================================

  const handleResolveAccount = async () => {
    setPayoutMessage("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/payouts/verify-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payoutForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not verify that account."
        );
      }

      setResolvedName(data.account_name);
    } catch (error) {
      setPayoutMessage(error.message);
    }
  };

  // ==========================================
  // SAVE PAYOUT ACCOUNT
  // ==========================================

  const handleSavePayout = async () => {
    setPayoutSubmitting(true);
    setPayoutMessage("");

    try {
      const bank = banks.find(
        (b) => b.code === payoutForm.bankCode
      );

      const response = await fetch(
        "http://localhost:5001/api/payouts/setup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            businessId: business._id,
            bankCode: payoutForm.bankCode,
            bankName: bank?.name || "",
            accountNumber: payoutForm.accountNumber,
            accountName: resolvedName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save payout account."
        );
      }

      setPayoutMessage(
        "Payout account linked successfully."
      );

      await fetchBusiness();
    } catch (error) {
      setPayoutMessage(error.message);
    } finally {
      setPayoutSubmitting(false);
    }
  };

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

  // ==========================================
  // NO BUSINESS
  // ==========================================

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F6] px-6 text-center">
        <div className="max-w-md">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFEDEC] text-2xl text-[#555]">
            ✦
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#242424]">
            Let's set up your business
          </h1>

          <p className="mt-2 text-gray-500">
            You're verified! Finish setting up your
            business to see your dashboard.
          </p>

          <button
            onClick={() => navigate("/onboarding")}
            className="mt-6 rounded-xl bg-[#242424] px-6 py-3 font-semibold text-white transition hover:bg-[#B96882]"
          >
            Start Setup
          </button>

        </div>
      </div>
    );
  }

  // ==========================================
  // STATS
  // ==========================================

  const todayCount = bookings.filter(
    (b) => b.status !== "Cancelled"
  ).length;

  const pendingCount = bookings.filter(
    (b) => b.status === "Pending"
  ).length;

  const completedCount = bookings.filter(
    (b) => b.status === "Completed"
  ).length;

  const confirmedBookings = bookings.filter(
    (b) => b.status === "Confirmed"
  );

  // ==========================================
  // BOOKING STATUS COLORS
  // ==========================================

  const statusColor = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const isTeamPlan = business.subscriptionPlan === "team";

  const navigation = [
    {
      id: "overview",
      label: "Overview",
      icon: "⌂",
    },
    {
      id: "profile",
      label: "Business Profile",
      icon: "◎",
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: "▣",
    },
    {
      id: "messages",
      label: "Messages",
      icon: "✉",
      count: conversations.length,
    },
    {
      id: "services",
      label: "Services",
      icon: "✦",
    },
    ...(isTeamPlan
      ? [
          {
            id: "staff",
            label: "Staff",
            icon: "♙",
          },
        ]
      : []),
    {
      id: "payouts",
      label: "Payouts",
      icon: "◆",
    },
  ];

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
              {business.name}
            </p>
          </div>

          <button
            onClick={() => setActiveSection("overview")}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#242424] font-bold text-white"
          >
            {business.name?.charAt(0)?.toUpperCase() ||
              "B"}
          </button>

        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px]">

        {/* ====================================
            SIDEBAR
        ==================================== */}

        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[#E5E2DF] bg-white px-5 py-8 lg:block">

          {/* Brand */}

          <div className="px-3">

            <p className="text-xl font-bold tracking-tight text-[#242424]">
              Book
              <span className="text-[#B96882]">
                Beautiq
              </span>
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Business Portal
            </p>

          </div>

          {/* Business */}

          <div className="mt-8 rounded-2xl bg-[#F5F4F2] p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#242424] font-bold text-white">

              {business.image ? (
  <img
    src={getImageUrl(business.image)}
    alt={business.name}
    className="h-full w-full object-cover"
  />

                ) : (
                  business.name
                    ?.charAt(0)
                    ?.toUpperCase() || "B"
                )}

              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-[#242424]">
                  {business.name}
                </p>

                <p className="mt-0.5 text-xs capitalize text-gray-500">
                  {business.status}
                </p>

              </div>

            </div>

          </div>

          {/* Navigation */}

          <nav className="mt-8 space-y-1">

            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Manage
            </p>

            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  setSelectedCustomer(null);
                }}
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

                {item.count > 0 && (
                  <span className="rounded-full bg-[#242424] px-2 py-0.5 text-[10px] font-bold text-white">
                    {item.count}
                  </span>
                )}

              </button>
            ))}

          </nav>

          {/* Bottom */}

          <div className="mt-auto pt-10">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-500 transition hover:bg-[#F5F4F2] hover:text-[#242424]"
            >
              <span>←</span>
              Back to BookBeautiq
            </button>

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
                  onClick={() => {
                    setActiveSection(item.id);
                    setSelectedCustomer(null);
                  }}
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
                Business Dashboard
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">

                {activeSection === "overview"
                  ? `Welcome back, ${business.name}`
                  : navigation.find(
                      (item) =>
                        item.id === activeSection
                    )?.label}

              </h1>

              <p className="mt-2 text-sm text-gray-500">

                {activeSection === "overview"
                  ? "Here's what's happening with your business."
                  : activeSection === "profile"
                  ? "Manage how customers see your business."
                  : `Manage your ${activeSection}.`}

              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden rounded-full bg-white px-4 py-2 text-sm shadow-sm sm:block">

                <span className="text-gray-400">
                  Status
                </span>{" "}

                <span className="font-semibold capitalize text-[#242424]">
                  {business.status}
                </span>

              </div>

            </div>

          </div>

          {/* ==================================
              OVERVIEW
          ================================== */}

          {activeSection === "overview" && (
            <div className="space-y-6">

              {/* Stats */}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* Business Link */}
<div className="rounded-2xl border border-[#E5E2DF] bg-white p-5 shadow-sm">

<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

  <div className="min-w-0">
    <p className="text-sm font-semibold text-[#242424]">
      Your Business Link
    </p>
    <p className="mt-1 truncate text-sm text-gray-500">
      {businessLink}
    </p>
  </div>

  <div className="flex shrink-0 gap-2">
    <button
      type="button"
      onClick={handleCopyLink}
      className="rounded-xl bg-[#242424] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9D536D]"
    >
      {linkCopied ? "Copied!" : "Copy Link"}
    </button>

    <a
      href={businessLink}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl border border-[#E5E2DF] px-5 py-2.5 text-sm font-semibold text-[#242424] transition hover:bg-[#F5F4F2]"
    >
      View
    </a>
  </div>

</div>

</div>
            {/* Subscription */}
<SubscriptionCard business={business} token={token} />



                {/* Total */}

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
                    {todayCount}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Active bookings
                  </p>

                </div>

                {/* Pending */}

                <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-gray-500">
                      Pending
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                      ◷
                    </span>

                  </div>

                  <p className="mt-4 text-3xl font-bold text-[#242424]">
                    {pendingCount}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Awaiting action
                  </p>

                </div>

                {/* Completed */}

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
                    {completedCount}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Completed bookings
                  </p>

                </div>

                {/* Messages */}

                <div className="rounded-2xl border border-[#E5E2DF] bg-white p-5 shadow-sm">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-medium text-gray-500">
                      Messages
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2E8EC] text-[#9D536D]">
                      ✉
                    </span>

                  </div>

                  <p className="mt-4 text-3xl font-bold text-[#242424]">
                    {conversations.length}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Customer conversations
                  </p>

                </div>

              </div>

              {/* Two column section */}

              <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">

                {/* Upcoming bookings */}

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

                    {bookings.length === 0 ? (
                      <div className="py-10 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F4F2]">
                          ▣
                        </div>

                        <p className="mt-3 text-sm font-semibold text-[#242424]">
                          No bookings yet
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Your appointments will appear here.
                        </p>

                      </div>
                    ) : (
                      <div className="space-y-3">

                        {bookings
                          .slice(0, 4)
                          .map((b) => (
                            <div
                              key={b._id}
                              className="flex flex-col gap-4 rounded-xl border border-[#E5E2DF] p-4 transition hover:border-[#C9C3C0] sm:flex-row sm:items-center sm:justify-between"
                            >

                              <div className="min-w-0">

                                <p className="font-semibold text-[#242424]">
                                  {b.customerName}
                                </p>

                                <p className="mt-1 truncate text-sm text-gray-500">
                                  {b.service} with{" "}
                                  {b.staff}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {b.date} at {b.time}
                                </p>

                              </div>

                              <div className="flex items-center gap-3">

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    statusColor[
                                      b.status
                                    ] ||
                                    "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {b.status}
                                </span>

                                {b.status ===
                                  "Confirmed" && (
                                  <button
                                    onClick={() =>
                                      handleMarkCompleted(
                                        b._id
                                      )
                                    }
                                    disabled={
                                      processingId ===
                                      b._id
                                    }
                                    className="rounded-lg bg-[#242424] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#9D536D] disabled:opacity-50"
                                  >
                                    {processingId ===
                                    b._id
                                      ? "..."
                                      : "Complete"}
                                  </button>
                                )}

                              </div>

                            </div>
                          ))}

                      </div>
                    )}

                  </div>

                </div>

                {/* Quick actions */}

                <div className="rounded-2xl border border-[#E5E2DF] bg-white p-6 shadow-sm">

                  <h2 className="font-bold text-[#242424]">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Manage your business quickly.
                  </p>

                  <div className="mt-5 space-y-3">

                    {/* Profile */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveSection("profile")
                      }
                      className="flex w-full items-center gap-4 rounded-xl border border-[#E5E2DF] p-4 text-left transition hover:border-[#C9C3C0] hover:bg-[#F8F7F6]"
                    >

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F1EF] text-[#242424]">
                        ◎
                      </span>

                      <div>

                        <p className="text-sm font-semibold text-[#242424]">
                          Edit Business Profile
                        </p>

                        <p className="text-xs text-gray-400">
                          Update your photos and information
                        </p>

                      </div>

                    </button>

                    {/* Services */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveSection("services")
                      }
                      className="flex w-full items-center gap-4 rounded-xl border border-[#E5E2DF] p-4 text-left transition hover:border-[#C9C3C0] hover:bg-[#F8F7F6]"
                    >

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F1EF] text-[#242424]">
                        +
                      </span>

                      <div>

                        <p className="text-sm font-semibold text-[#242424]">
                          Manage Services
                        </p>

                        <p className="text-xs text-gray-400">
                          Add or edit your services
                        </p>

                      </div>

                    </button>

                    {/* Staff */}

                    {isTeamPlan && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSection("staff")
                        }
                        className="flex w-full items-center gap-4 rounded-xl border border-[#E5E2DF] p-4 text-left transition hover:border-[#C9C3C0] hover:bg-[#F8F7F6]"
                      >

                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F1EF] text-[#242424]">
                          ♙
                        </span>

                        <div>

                          <p className="text-sm font-semibold text-[#242424]">
                            Manage Staff
                          </p>

                          <p className="text-xs text-gray-400">
                            Manage your team
                          </p>

                        </div>

                      </button>
                    )}

                    {/* Payout */}

                    <button
                      type="button"
                      onClick={() =>
                        setActiveSection("payouts")
                      }
                      className="flex w-full items-center gap-4 rounded-xl border border-[#E5E2DF] p-4 text-left transition hover:border-[#C9C3C0] hover:bg-[#F8F7F6]"
                    >

                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F1EF] text-[#242424]">
                        ◆
                      </span>

                      <div>

                        <p className="text-sm font-semibold text-[#242424]">
                          Payout Account
                        </p>

                        <p className="text-xs text-gray-400">
                          Manage your bank account
                        </p>

                      </div>

                    </button>

                  </div>

                </div>

              </div>

              {/* Business status */}

              {business.status === "pending" && (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

                  <div className="flex gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                      ⏳
                    </div>

                    <div>

                      <p className="font-semibold text-yellow-800">
                        Your business is awaiting approval
                      </p>

                      <p className="mt-1 text-sm leading-6 text-yellow-700">
                        Your business profile is currently
                        being reviewed by the BookBeautiq
                        team. It will become publicly visible
                        once approved.
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* ==================================
              BUSINESS PROFILE
          ================================== */}

          {activeSection === "profile" && (
            <div className="space-y-6">

              <div className="rounded-2xl border border-[#E5E2DF] bg-white shadow-sm">

                <div className="border-b border-[#E5E2DF] px-6 py-5">

                  <h2 className="font-bold text-[#242424]">
                    Business Profile
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Manage how your business appears to customers.
                  </p>

                </div>

                <div className="p-6 sm:p-8">

                  {/* COVER */}

                  <div>

                    <div className="mb-3">

                      <h3 className="font-bold text-[#242424]">
                        Business Cover
                      </h3>

                      <p className="mt-1 text-sm text-[#777472]">
                        This is the main image customers see
                        when discovering your business.
                      </p>

                    </div>

                    <label className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-dashed border-[#D8D4D1] bg-[#FAFAF9]">

                      {coverPreview ? (
                        <>
                          <img
                            src={coverPreview}
                            alt="Business cover"
                            className="h-64 w-full object-cover"
                          />

                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">

                            <span className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#242424] opacity-0 shadow-lg transition group-hover:opacity-100">
                              Change Cover
                            </span>

                          </div>
                        </>
                      ) : (
                        <div className="flex h-64 flex-col items-center justify-center">

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFEDEC] text-xl text-[#777]">
                            +
                          </div>

                          <p className="mt-3 text-sm font-semibold text-[#242424]">
                            Add business cover
                          </p>

                          <p className="mt-1 text-xs text-[#999]">
                            JPG, PNG or WEBP
                          </p>

                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleDashboardCoverChange
                        }
                        className="hidden"
                      />

                    </label>

                  </div>

                  {/* GALLERY */}

                  <div className="mt-10">

                    <div className="mb-4 flex items-end justify-between">

                      <div>

                        <h3 className="font-bold text-[#242424]">
                          Work Gallery
                        </h3>

                        <p className="mt-1 text-sm text-[#777472]">
                          Showcase up to 5 examples of your work.
                        </p>

                      </div>

                      <span className="text-xs font-semibold text-[#999]">
                        {galleryPreviews.length}/5
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

                      {galleryPreviews.map(
                        (image, index) => (
                          <div
                            key={`${image}-${index}`}
                            className="group relative aspect-square overflow-hidden rounded-2xl bg-[#F1EFED]"
                          >

                            <img
                              src={image}
                              alt={`Business work ${
                                index + 1
                              }`}
                              className="h-full w-full object-cover"
                            />

                            {index >=
                              (business.gallery
                                ?.length || 0) && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeNewGalleryImage(
                                    index
                                  )
                                }
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                              >
                                ×
                              </button>
                            )}

                          </div>
                        )
                      )}

                      {galleryPreviews.length < 5 && (
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8D4D1] bg-[#FAFAF9] transition hover:border-[#AAA5A1] hover:bg-white">

                          <span className="text-2xl text-[#777]">
                            +
                          </span>

                          <span className="mt-2 text-xs font-semibold text-[#666]">
                            Add photo
                          </span>

                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={
                              handleDashboardGalleryChange
                            }
                            className="hidden"
                          />

                        </label>
                      )}

                    </div>

                  </div>

                  {/* INFORMATION */}

                  <div className="mt-10 border-t border-[#ECE9E6] pt-10">

                    <h3 className="font-bold text-[#242424]">
                      Business Information
                    </h3>

                    <p className="mt-1 text-sm text-[#777472]">
                      Keep your public business information up to date.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">

                      {/* Name */}

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-[#242424]">
                          Business Name
                        </label>

                        <input
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
                        />

                      </div>

                      {/* Category */}

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-[#242424]">
                          Category
                        </label>

                        <input
                          value={profileForm.category}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              category: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
                        />

                      </div>

                      {/* Location */}

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-[#242424]">
                          Location
                        </label>

                        <input
                          value={profileForm.location}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              location: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
                        />

                      </div>

                      {/* Price */}

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-[#242424]">
                          Starting Price
                        </label>

                        <input
                          value={profileForm.price}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              price: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
                        />

                      </div>

                      {/* Phone */}

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-[#242424]">
                          Phone
                        </label>

                        <input
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phone: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
                        />

                      </div>

                      {/* Email */}

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-[#242424]">
                          Business Email
                        </label>

                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
                        />

                      </div>

                      {/* Opening Hours */}

                      <div className="sm:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-[#242424]">
                          Opening Hours
                        </label>

                        <input
                          value={profileForm.openingHours}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              openingHours:
                                e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
                        />

                      </div>

                                            {/* Instagram */}

                                            <div>

<label className="mb-2 block text-sm font-semibold text-[#242424]">
  Instagram Link
</label>

<input
  type="url"
  placeholder="https://instagram.com/yourbusiness"
  value={profileForm.instagramUrl}
  onChange={(e) =>
    setProfileForm({
      ...profileForm,
      instagramUrl: e.target.value,
    })
  }
  className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
/>

</div>

{/* TikTok */}

<div>

<label className="mb-2 block text-sm font-semibold text-[#242424]">
  TikTok Link
</label>

<input
  type="url"
  placeholder="https://tiktok.com/@yourbusiness"
  value={profileForm.tiktokUrl}
  onChange={(e) =>
    setProfileForm({
      ...profileForm,
      tiktokUrl: e.target.value,
    })
  }
  className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
/>

</div>


                      {/* Description */}

                      <div className="sm:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-[#242424]">
                          Description
                        </label>

                        <textarea
                          rows={5}
                          value={profileForm.description}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              description:
                                e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#777]"
                        />

                      </div>

                    </div>

                  </div>

                  {/* SAVE */}

                  <div className="mt-8 flex flex-col gap-4 border-t border-[#ECE9E6] pt-6 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-h-[24px]">

                      {profileMessage && (
                        <p
                          className={`text-sm ${
                            profileMessage.includes(
                              "successfully"
                            )
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {profileMessage}
                        </p>
                      )}

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleSaveBusinessProfile
                      }
                      disabled={profileSaving}
                      className="rounded-xl bg-[#242424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#9D536D] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {profileSaving
                        ? "Saving Changes..."
                        : "Save Changes"}
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
                  All Bookings
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Manage your customer appointments.
                </p>

              </div>

              <div className="p-5">

                {bookings.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No bookings yet.
                  </div>
                ) : (
                  <div className="space-y-3">

                    {bookings.map((b) => (
                      <div
                        key={b._id}
                        className="rounded-xl border border-[#E5E2DF] p-5"
                      >

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div>

                            <h3 className="font-bold text-[#242424]">
                              {b.customerName}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {b.service} with{" "}
                              {b.staff}
                            </p>

                            <p className="mt-1 text-sm text-gray-400">
                              {b.date} at {b.time}
                            </p>

                          </div>

                          <div className="flex flex-wrap items-center gap-3">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                statusColor[
                                  b.status
                                ] ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {b.status}
                            </span>

                            {b.status ===
                              "Confirmed" && (
                              <button
                                onClick={() =>
                                  handleMarkCompleted(
                                    b._id
                                  )
                                }
                                disabled={
                                  processingId ===
                                  b._id
                                }
                                className="rounded-xl bg-[#242424] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9D536D] disabled:opacity-50"
                              >
                                {processingId ===
                                b._id
                                  ? "Processing..."
                                  : "Mark Completed"}
                              </button>
                            )}

                          </div>

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
                  Communicate with your customers.
                </p>

              </div>

              <div className="grid min-h-[500px] lg:grid-cols-[280px_1fr]">

                {/* Conversations */}

                <div className="border-b border-[#E5E2DF] p-4 lg:border-b-0 lg:border-r">

                  <p className="px-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Conversations
                  </p>

                  <div className="mt-3 space-y-1">

                    {conversations.length === 0 ? (
                      <p className="px-2 py-6 text-sm text-gray-400">
                        No conversations yet.
                      </p>
                    ) : (
                      conversations.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => {
                            setSelectedCustomer(c._id);
                            setTimeout(() => fetchConversations(business._id), 800);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                            selectedCustomer ===
                            c._id
                              ? "bg-[#F2E8EC]"
                              : "hover:bg-[#F5F4F2]"
                          }`}
                        >

                          <p
                            className={`truncate text-sm font-semibold ${
                              selectedCustomer ===
                              c._id
                                ? "text-[#9D536D]"
                                : "text-[#242424]"
                            }`}
                          >
                            {c._id}
                          </p>

                          {c.unreadCount > 0 && (
                            <span className="ml-2 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#242424] px-1.5 text-[10px] font-bold text-white">
                              {c.unreadCount}
                            </span>
                          )}

                        </button>
                      ))

                    )}

                  </div>

                </div>

                {/* Chat */}

                <div className="p-5">

                  {selectedCustomer ? (
                    <BusinessChatWidget
                      businessId={business._id}
                      customerEmail={
                        selectedCustomer
                      }
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
                          Choose a customer to start chatting.
                        </p>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ==================================
              PAYOUTS
          ================================== */}

          {activeSection === "payouts" && (
            <div className="max-w-3xl">

              <div className="rounded-2xl border border-[#E5E2DF] bg-white p-6 shadow-sm sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F1EF] text-[#242424]">
                    ◆
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-[#242424]">
                      Payout Account
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Link your bank account to receive
                      deposit payments. Settlements
                      typically take 1–2 business days.
                    </p>

                  </div>

                </div>

                {business.paystackSubaccountCode ? (
                  <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">

                    <div className="flex gap-3">

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-600">
                        ✓
                      </span>

                      <div>

                        <p className="font-semibold text-green-800">
                          Payout account connected
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          {business.bankName} —{" "}
                          {business.bankAccountName}
                        </p>

                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="mt-8 space-y-5">

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-[#242424]">
                        Bank
                      </label>

                      <select
                        value={
                          payoutForm.bankCode
                        }
                        onChange={(e) =>
                          setPayoutForm({
                            ...payoutForm,
                            bankCode:
                              e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-[#D9D5D1] bg-white p-4 text-sm outline-none transition focus:border-[#777]"
                      >

                        <option value="">
                          Select your bank
                        </option>

                        {banks.map((bank) => (
                          <option
                            key={bank.code}
                            value={bank.code}
                          >
                            {bank.name}
                          </option>
                        ))}

                      </select>

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-[#242424]">
                        Account Number
                      </label>

                      <input
                        type="text"
                        placeholder="Enter account number"
                        value={
                          payoutForm.accountNumber
                        }
                        onChange={(e) =>
                          setPayoutForm({
                            ...payoutForm,
                            accountNumber:
                              e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-[#D9D5D1] p-4 text-sm outline-none transition focus:border-[#777]"
                      />

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleResolveAccount
                      }
                      className="rounded-xl border border-[#242424] px-5 py-3 text-sm font-semibold text-[#242424] transition hover:bg-[#F5F4F2]"
                    >
                      Verify Account
                    </button>

                    {resolvedName && (
                      <div className="rounded-xl bg-[#F5F4F2] p-4 text-sm">

                        <span className="text-gray-500">
                          Account Name
                        </span>

                        <p className="mt-1 font-semibold text-[#242424]">
                          {resolvedName}
                        </p>

                      </div>
                    )}

                    {payoutMessage && (
                      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                        {payoutMessage}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleSavePayout
                      }
                      disabled={
                        !resolvedName ||
                        payoutSubmitting
                      }
                      className="w-full rounded-xl bg-[#242424] py-4 font-semibold text-white transition hover:bg-[#9D536D] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {payoutSubmitting
                        ? "Saving..."
                        : "Save Payout Account"}
                    </button>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* ==================================
              SERVICES
          ================================== */}

          {activeSection === "services" && (
            <div>
              <ServiceManager
                businesses={[business]}
              />
            </div>
          )}

          {/* ==================================
              STAFF
          ================================== */}

          {activeSection === "staff" && isTeamPlan && (
            <div>
              <StaffManager
                businesses={[business]}
              />
            </div>
          )}

        </main>

      </div>
    </div>
  );
}

export default BusinessDashboard;
