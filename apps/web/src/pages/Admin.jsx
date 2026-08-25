import { useEffect, useState } from "react";
import BusinessList from "../components/admin/BusinessList";
import ServiceManager from "../components/admin/ServiceManager";
import StaffManager from "../components/admin/StaffManager";
import OwnerVerifications from "../components/admin/OwnerVerifications.jsx";

function Admin() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    image: "",
    price: "",
    phone: "",
    email: "",
    openingHours: "",
  });

  const [businesses, setBusinesses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // =========================
  // DASHBOARD NAVIGATION
  // =========================

  const [activeSection, setActiveSection] = useState("overview");

  // =========================
  // FETCH BUSINESSES
  // =========================

  const fetchBusinesses = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/businesses"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch businesses."
        );
      }

      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // =========================
  // FORM HANDLING
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // =========================
  // SAVE / UPDATE BUSINESS
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      let imageUrl = formData.image;

      // Upload image first
      if (imageFile) {
        const imageData = new FormData();

        imageData.append("image", imageFile);

        const uploadResponse = await fetch(
          "http://localhost:5001/api/uploads",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageData,
          }
        );

        const uploadResult =
          await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.message ||
              "Image upload failed."
          );
        }

        imageUrl = uploadResult.imageUrl;
      }

      const url = editingId
        ? `http://localhost:5001/api/businesses/${editingId}`
        : "http://localhost:5001/api/businesses";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save business."
        );
      }

      alert(
        editingId
          ? "Business updated successfully!"
          : "Business added successfully!"
      );

      setFormData({
        name: "",
        category: "",
        location: "",
        description: "",
        image: "",
        price: "",
        phone: "",
        email: "",
        openingHours: "",
      });

      setImageFile(null);
      setImagePreview("");
      setEditingId(null);

      await fetchBusinesses();

      setActiveSection("businesses");
    } catch (error) {
      console.error(
        "Save business error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong."
      );
    }
  };

  // =========================
  // EDIT BUSINESS
  // =========================

  const editBusiness = (business) => {
    setEditingId(business._id);

    setFormData({
      name: business.name || "",
      category: business.category || "",
      location: business.location || "",
      description: business.description || "",
      image: business.image || "",
      price: business.price || "",
      phone: business.phone || "",
      email: business.email || "",
      openingHours:
        business.openingHours || "",
    });

    setImageFile(null);

    if (business.image) {
      const existingImage =
        business.image.startsWith("/uploads/")
          ? `http://localhost:5001${business.image}`
          : business.image;

      setImagePreview(existingImage);
    } else {
      setImagePreview("");
    }

    setActiveSection("businesses");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DASHBOARD STATS
  // =========================

  const totalBusinesses = businesses.length;

  const approvedBusinesses =
    businesses.filter(
      (business) =>
        business.status === "approved"
    ).length;

  const pendingBusinesses =
    businesses.filter(
      (business) =>
        business.status === "pending"
    ).length;

  const rejectedBusinesses =
    businesses.filter(
      (business) =>
        business.status === "rejected"
    ).length;

  // =========================
  // NAVIGATION ITEMS
  // =========================

  const navigation = [
    {
      id: "overview",
      label: "Overview",
      icon: "⌂",
    },
    {
      id: "businesses",
      label: "Businesses",
      icon: "◈",
    },
    {
      id: "verification",
      label: "Verification",
      icon: "✓",
    },
    {
      id: "services",
      label: "Services",
      icon: "✦",
    },
    {
      id: "staff",
      label: "Staff",
      icon: "♙",
    },
  ];

  // =========================
  // REUSABLE INPUT STYLE
  // =========================

  const inputClass =
    "w-full rounded-xl border border-[#E9E3E9] bg-[#FCFAFD] px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-[#99939A] focus:border-[#D97CA5] focus:bg-white focus:ring-4 focus:ring-[#D97CA5]/10";

  return (
    <div className="min-h-screen bg-[#FAF8FC] text-[#171717]">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-[#E9E3E9] bg-white lg:block">

        <div className="flex h-full flex-col">

          {/* Logo */}

          <div className="border-b border-[#EEE9EF] px-7 py-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D97CA5] text-lg font-bold text-white shadow-sm">
                B
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight">
                  BookBeautiq
                </p>

                <p className="text-xs text-[#918A92]">
                  Admin Console
                </p>
              </div>

            </div>

          </div>

          {/* Navigation */}

          <nav className="flex-1 px-4 py-6">

            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A19AA2]">
              Management
            </p>

            <div className="space-y-1">

              {navigation.map((item) => {

                const active =
                  activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(item.id)
                    }
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "bg-[#FFF1F6] text-[#D97CA5]"
                        : "text-[#655F66] hover:bg-[#FAF6F9] hover:text-[#171717]"
                    }`}
                  >

                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                        active
                          ? "bg-[#D97CA5] text-white"
                          : "bg-[#F5F1F5] text-[#817A82] group-hover:bg-white"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>

                    {item.id ===
                      "businesses" &&
                      pendingBusinesses > 0 && (
                        <span className="ml-auto rounded-full bg-[#D97CA5] px-2 py-0.5 text-[10px] font-bold text-white">
                          {pendingBusinesses}
                        </span>
                      )}

                  </button>
                );
              })}

            </div>

          </nav>

          {/* Sidebar Footer */}

          <div className="border-t border-[#EEE9EF] p-5">

            <div className="rounded-2xl bg-[#FAF7FA] p-4">

              <p className="text-xs font-semibold text-[#171717]">
                BookBeautiq
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[#918A92]">
                Manage your beauty marketplace from one place.
              </p>

            </div>

          </div>

        </div>

      </aside>

      {/* ==================================================
          MOBILE TOP NAV
      ================================================== */}

      <div className="sticky top-0 z-30 border-b border-[#E9E3E9] bg-white/95 px-4 py-4 backdrop-blur lg:hidden">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D97CA5] font-bold text-white">
              B
            </div>

            <div>
              <p className="text-sm font-bold">
                BookBeautiq
              </p>

              <p className="text-[10px] text-[#918A92]">
                Admin Console
              </p>
            </div>

          </div>

          <select
            value={activeSection}
            onChange={(e) =>
              setActiveSection(e.target.value)
            }
            className="rounded-xl border border-[#E5DFE5] bg-white px-3 py-2 text-xs font-semibold outline-none"
          >
            {navigation.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.label}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="lg:ml-64">

        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-10">

          {/* ==================================================
              OVERVIEW
          ================================================== */}

          {activeSection === "overview" && (
            <>

              {/* Header */}

              <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

                <div>

                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D97CA5]">
                    Admin Dashboard
                  </p>

                  <h1 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
                    Good to see you.
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#77717A]">
                    Manage businesses, verification,
                    services and staff across BookBeautiq.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: "",
                      category: "",
                      location: "",
                      description: "",
                      image: "",
                      price: "",
                      phone: "",
                      email: "",
                      openingHours: "",
                    });
                    setImageFile(null);
                    setImagePreview("");
                    setActiveSection("businesses");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D97CA5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C96C96] hover:shadow-md"
                >
                  <span className="text-lg leading-none">
                    +
                  </span>
                  Add Business
                </button>

              </div>

              {/* Stats */}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border border-[#EAE4EA] bg-white p-5 shadow-[0_8px_30px_rgba(50,35,50,0.04)]">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-xs font-semibold text-[#8D858D]">
                        Total Businesses
                      </p>

                      <p className="mt-3 text-3xl font-bold tracking-tight">
                        {totalBusinesses}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1F6] text-[#D97CA5]">
                      ◈
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-[#918A92]">
                    Businesses registered on the platform
                  </p>

                </div>

                <div className="rounded-2xl border border-[#EAE4EA] bg-white p-5 shadow-[0_8px_30px_rgba(50,35,50,0.04)]">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-xs font-semibold text-[#8D858D]">
                        Approved
                      </p>

                      <p className="mt-3 text-3xl font-bold tracking-tight">
                        {approvedBusinesses}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF8F1] text-[#3E8B58]">
                      ✓
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-[#918A92]">
                    Currently approved businesses
                  </p>

                </div>

                <div className="rounded-2xl border border-[#EAE4EA] bg-white p-5 shadow-[0_8px_30px_rgba(50,35,50,0.04)]">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-xs font-semibold text-[#8D858D]">
                        Pending
                      </p>

                      <p className="mt-3 text-3xl font-bold tracking-tight text-[#D97CA5]">
                        {pendingBusinesses}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E9] text-[#C98524]">
                      !
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-[#918A92]">
                    Businesses awaiting approval
                  </p>

                </div>

                <div className="rounded-2xl border border-[#EAE4EA] bg-white p-5 shadow-[0_8px_30px_rgba(50,35,50,0.04)]">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-xs font-semibold text-[#8D858D]">
                        Rejected
                      </p>

                      <p className="mt-3 text-3xl font-bold tracking-tight">
                        {rejectedBusinesses}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0EF] text-[#D94A45]">
                      ×
                    </div>

                  </div>

                  <p className="mt-4 text-xs text-[#918A92]">
                    Businesses not approved
                  </p>

                </div>

              </div>

              {/* Quick Actions */}

              <div className="mt-8">

                <div className="mb-4">

                  <h2 className="text-lg font-bold">
                    Quick management
                  </h2>

                  <p className="mt-1 text-sm text-[#88818A]">
                    Jump directly to the area you need.
                  </p>

                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("businesses")
                    }
                    className="group rounded-2xl border border-[#EAE4EA] bg-white p-5 text-left shadow-[0_8px_30px_rgba(50,35,50,0.04)] transition hover:-translate-y-0.5 hover:border-[#E8C5D4] hover:shadow-lg"
                  >

                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1F6] text-[#D97CA5]">
                      ◈
                    </div>

                    <h3 className="font-bold">
                      Businesses
                    </h3>

                    <p className="mt-1 text-sm text-[#88818A]">
                      Add, edit and manage businesses.
                    </p>

                    <span className="mt-4 inline-block text-xs font-bold text-[#D97CA5]">
                      Manage →
                    </span>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("verification")
                    }
                    className="group rounded-2xl border border-[#EAE4EA] bg-white p-5 text-left shadow-[0_8px_30px_rgba(50,35,50,0.04)] transition hover:-translate-y-0.5 hover:border-[#E8C5D4] hover:shadow-lg"
                  >

                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF7E9] text-[#C98524]">
                      ✓
                    </div>

                    <h3 className="font-bold">
                      Verification
                    </h3>

                    <p className="mt-1 text-sm text-[#88818A]">
                      Review business owner documents.
                    </p>

                    <span className="mt-4 inline-block text-xs font-bold text-[#D97CA5]">
                      Review →
                    </span>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("services")
                    }
                    className="group rounded-2xl border border-[#EAE4EA] bg-white p-5 text-left shadow-[0_8px_30px_rgba(50,35,50,0.04)] transition hover:-translate-y-0.5 hover:border-[#E8C5D4] hover:shadow-lg"
                  >

                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4F1FB] text-[#7256A5]">
                      ✦
                    </div>

                    <h3 className="font-bold">
                      Services
                    </h3>

                    <p className="mt-1 text-sm text-[#88818A]">
                      Create and manage beauty services.
                    </p>

                    <span className="mt-4 inline-block text-xs font-bold text-[#D97CA5]">
                      Manage →
                    </span>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("staff")
                    }
                    className="group rounded-2xl border border-[#EAE4EA] bg-white p-5 text-left shadow-[0_8px_30px_rgba(50,35,50,0.04)] transition hover:-translate-y-0.5 hover:border-[#E8C5D4] hover:shadow-lg"
                  >

                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5F5] text-[#477777]">
                      ♙
                    </div>

                    <h3 className="font-bold">
                      Staff
                    </h3>

                    <p className="mt-1 text-sm text-[#88818A]">
                      Manage business team members.
                    </p>

                    <span className="mt-4 inline-block text-xs font-bold text-[#D97CA5]">
                      Manage →
                    </span>

                  </button>

                </div>

              </div>

              {/* Recent Businesses */}

              <div className="mt-8 rounded-2xl border border-[#EAE4EA] bg-white p-6 shadow-[0_8px_30px_rgba(50,35,50,0.04)]">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h2 className="text-lg font-bold">
                      Recent businesses
                    </h2>

                    <p className="mt-1 text-sm text-[#88818A]">
                      Latest businesses added to BookBeautiq.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("businesses")
                    }
                    className="text-xs font-bold text-[#D97CA5] hover:underline"
                  >
                    View all
                  </button>

                </div>

                {businesses.length === 0 ? (

                  <div className="mt-6 rounded-xl border border-dashed border-[#DDD5DD] p-8 text-center">

                    <p className="font-semibold">
                      No businesses yet
                    </p>

                    <p className="mt-1 text-sm text-[#918A92]">
                      Add your first business to get started.
                    </p>

                  </div>

                ) : (

                  <div className="mt-5 divide-y divide-[#EEE9EF]">

                    {businesses
                      .slice(0, 4)
                      .map((business) => (

                        <div
                          key={business._id}
                          className="flex items-center justify-between gap-4 py-4"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F5F1F5] text-sm font-bold text-[#77717A]">

                              {business.image ? (
                                <img
                                  src={
                                    business.image.startsWith(
                                      "/uploads/"
                                    )
                                      ? `http://localhost:5001${business.image}`
                                      : business.image
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                business.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "B"
                              )}

                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-bold">
                                {business.name}
                              </p>

                              <p className="truncate text-xs text-[#918A92]">
                                {business.category || "Beauty business"}{" "}
                                ·{" "}
                                {business.location || "Location not set"}
                              </p>

                            </div>

                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              business.status ===
                              "approved"
                                ? "bg-[#EDF8F0] text-[#3F8757]"
                                : business.status ===
                                  "rejected"
                                ? "bg-[#FFF0EF] text-[#D94A45]"
                                : "bg-[#FFF7E9] text-[#B77719]"
                            }`}
                          >
                            {business.status || "pending"}
                          </span>

                        </div>

                      ))}

                  </div>

                )}

              </div>

            </>
          )}

          {/* ==================================================
              BUSINESSES
          ================================================== */}

          {activeSection === "businesses" && (
            <>

              <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97CA5]">
                    Management
                  </p>

                  <h1 className="mt-2 text-3xl font-bold tracking-tight">
                    Businesses
                  </h1>

                  <p className="mt-2 text-sm text-[#817A82]">
                    Add new businesses or manage existing listings.
                  </p>

                </div>

                <div className="rounded-xl border border-[#E8E2E8] bg-white px-4 py-3">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#99919A]">
                    Total
                  </p>

                  <p className="mt-0.5 text-xl font-bold">
                    {totalBusinesses}
                  </p>

                </div>

              </div>

              {/* Add / Edit Business */}

              <div className="rounded-2xl border border-[#EAE4EA] bg-white p-6 shadow-[0_8px_30px_rgba(50,35,50,0.04)] sm:p-8">

                <div className="mb-7 flex items-start justify-between gap-4">

                  <div>

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1F6] text-[#D97CA5]">
                        {editingId ? "✎" : "+"}
                      </div>

                      <div>

                        <h2 className="text-xl font-bold">
                          {editingId
                            ? "Edit Business"
                            : "Add Business"}
                        </h2>

                        <p className="mt-0.5 text-xs text-[#918A92]">
                          {editingId
                            ? "Update the business information below."
                            : "Create a new business listing for BookBeautiq."}
                        </p>

                      </div>

                    </div>

                  </div>

                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          name: "",
                          category: "",
                          location: "",
                          description: "",
                          image: "",
                          price: "",
                          phone: "",
                          email: "",
                          openingHours: "",
                        });
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-[#77717A] hover:bg-[#F8F3F7]"
                    >
                      Cancel edit
                    </button>
                  )}

                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >

                  {/* Basic Information */}

                  <div>

                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9A929A]">
                      Business information
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">

                      <input
                        type="text"
                        name="name"
                        placeholder="Business Name"
                        value={formData.name}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />

                      <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />

                      <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        value={formData.location}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />

                      <input
                        type="text"
                        name="price"
                        placeholder="Starting Price (e.g. AED 120)"
                        value={formData.price}
                        onChange={handleChange}
                        className={inputClass}
                      />

                    </div>

                  </div>

                  {/* Contact */}

                  <div>

                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9A929A]">
                      Contact & hours
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">

                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        className={inputClass}
                      />

                      <input
                        type="email"
                        name="email"
                        placeholder="Business Email"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                      />

                      <input
                        type="text"
                        name="openingHours"
                        placeholder="Opening Hours (e.g. 9:00 AM - 8:00 PM)"
                        value={formData.openingHours}
                        onChange={handleChange}
                        className={`${inputClass} md:col-span-2`}
                      />

                    </div>

                  </div>

                  {/* Image */}

                  <div>

                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9A929A]">
                      Business image
                    </p>

                    <div className="grid gap-5 md:grid-cols-[1fr_180px]">

                      <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#E5C4D2] bg-[#FFFAFC] px-5 py-6 text-center transition hover:border-[#D97CA5] hover:bg-[#FFF7FA]">

                        <span className="text-2xl">
                          ↑
                        </span>

                        <span className="mt-2 text-sm font-semibold text-[#4D474D]">
                          Choose business image
                        </span>

                        <span className="mt-1 text-xs text-[#9A929A]">
                          JPG, PNG or WEBP
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />

                      </label>

                      {imagePreview ? (

                        <div className="overflow-hidden rounded-xl border border-[#EAE4EA] bg-[#F7F3F7]">

                          <img
                            src={imagePreview}
                            alt="Business preview"
                            className="h-full min-h-[120px] w-full object-cover"
                          />

                        </div>

                      ) : (

                        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-[#EAE4EA] bg-[#F8F4F8] text-center">

                          <p className="px-4 text-xs text-[#9A929A]">
                            Image preview
                          </p>

                        </div>

                      )}

                    </div>

                  </div>

                  {/* Description */}

                  <div>

                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9A929A]">
                      Description
                    </p>

                    <textarea
                      name="description"
                      placeholder="Business Description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className={inputClass}
                      required
                    />

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#D97CA5] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#C96C96] hover:shadow-md"
                  >
                    {editingId
                      ? "Update Business"
                      : "Save Business"}
                  </button>

                </form>

              </div>

              {/* Existing Businesses */}

              <div className="mt-8">

                <div className="mb-4">

                  <h2 className="text-xl font-bold">
                    All Businesses
                  </h2>

                  <p className="mt-1 text-sm text-[#817A82]">
                    Manage your existing business listings.
                  </p>

                </div>

                <BusinessList
                  businesses={businesses}
                  fetchBusinesses={fetchBusinesses}
                  editBusiness={editBusiness}
                />

              </div>

            </>
          )}

          {/* ==================================================
              VERIFICATION
          ================================================== */}

          {activeSection === "verification" && (
            <>

              <div className="mb-7">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97CA5]">
                  Compliance
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                  Owner Verification
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#817A82]">
                  Review identity and business documents before approving business accounts.
                </p>

              </div>

              <div className="rounded-2xl border border-[#EAE4EA] bg-white p-4 shadow-[0_8px_30px_rgba(50,35,50,0.04)] sm:p-6">

                <OwnerVerifications />

              </div>

            </>
          )}

          {/* ==================================================
              SERVICES
          ================================================== */}

          {activeSection === "services" && (
            <>

              <div className="mb-7">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97CA5]">
                  Catalog
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                  Services
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#817A82]">
                  Create and manage the services offered by businesses on BookBeautiq.
                </p>

              </div>

              <div className="rounded-2xl border border-[#EAE4EA] bg-white p-4 shadow-[0_8px_30px_rgba(50,35,50,0.04)] sm:p-6">

                <ServiceManager
                  businesses={businesses}
                />

              </div>

            </>
          )}

          {/* ==================================================
              STAFF
          ================================================== */}

          {activeSection === "staff" && (
            <>

              <div className="mb-7">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D97CA5]">
                  Team
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                  Staff Manager
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#817A82]">
                  Manage the professionals working at businesses on BookBeautiq.
                </p>

              </div>

              <div className="rounded-2xl border border-[#EAE4EA] bg-white p-4 shadow-[0_8px_30px_rgba(50,35,50,0.04)] sm:p-6">

                <StaffManager
                  businesses={businesses}
                />

              </div>

            </>
          )}

        </div>

      </main>

    </div>
  );
}

export default Admin;