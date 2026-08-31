import { useState } from "react";
import { useNavigate } from "react-router-dom";

function BusinessOnboarding() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [step, setStep] = useState(1);
  const [businessId, setBusinessId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("independent");


  // ==========================================
  // BUSINESS
  // ==========================================

  const [businessData, setBusinessData] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    price: "",
    phone: "",
    email: "",
    openingHours: "",
  });

  // ==========================================
  // OWNER PROFILE PHOTO
  // ==========================================

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  // ==========================================
  // BUSINESS PHOTOS
  // ==========================================

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [workImages, setWorkImages] = useState([]);
  const [workPreviews, setWorkPreviews] = useState([]);

  // ==========================================
  // SERVICES
  // ==========================================

  const [services, setServices] = useState([
    {
      name: "",
      duration: "",
      price: "",
      category: "",
    },
  ]);

  // ==========================================
  // STAFF
  // ==========================================

  const [staff, setStaff] = useState([
    {
      name: "",
      role: "",
      phone: "",
      email: "",
      imageFile: null,
      imagePreview: "",
    },
  ]);

  // ==========================================
  // COMMON INPUT STYLE
  // ==========================================

  const inputClass =
    "w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] px-4 py-3.5 text-sm text-[#202124] outline-none transition placeholder:text-[#969390] focus:border-[#8C8885] focus:bg-white focus:ring-4 focus:ring-[#222222]/5";

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
  // OWNER PROFILE PHOTO
  // ==========================================

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid profile image.");
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
    setError("");
  };

  // ==========================================
  // STEP 1: CREATE BUSINESS
  // ==========================================

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      // ----------------------------------------
      // CREATE BUSINESS
      // ----------------------------------------

      const response = await fetch(
        "http://localhost:5001/api/businesses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...businessData,
            subscriptionPlan: selectedPlan,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create business."
        );
      }

      const createdBusinessId = data.business._id;

      setBusinessId(createdBusinessId);

      // ----------------------------------------
      // SAVE OWNER PROFILE IMAGE
      // ----------------------------------------

      if (profileFile) {
        const profileUrl = await uploadImage(profileFile);

        const profileResponse = await fetch(
          "http://localhost:5001/api/users/profile",
          {

            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              profileImage: profileUrl,
            }),
          }
        );

        const profileData =
          await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileData.message ||
              "Business was created, but profile photo could not be saved."
          );
        }
      }

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // COVER IMAGE
  // ==========================================

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid cover image.");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError("");
  };

  // ==========================================
  // WORK IMAGES
  // MAX 5
  // ==========================================

  const handleWorkImagesChange = (e) => {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    const validFiles = selectedFiles.filter(
      (file) => file.type.startsWith("image/")
    );

    const remainingSlots =
      5 - workImages.length;

    const filesToAdd = validFiles.slice(
      0,
      remainingSlots
    );

    const combined = [
      ...workImages,
      ...filesToAdd,
    ];

    setWorkImages(combined);

    setWorkPreviews(
      combined.map((file) =>
        URL.createObjectURL(file)
      )
    );

    if (
      validFiles.length > remainingSlots
    ) {
      setError(
        "You can add a maximum of 5 work images."
      );
    } else {
      setError("");
    }

    e.target.value = "";
  };

  const removeWorkImage = (index) => {
    const updatedFiles = workImages.filter(
      (_, i) => i !== index
    );

    setWorkImages(updatedFiles);

    setWorkPreviews(
      updatedFiles.map((file) =>
        URL.createObjectURL(file)
      )
    );
  };

  // ==========================================
  // SAVE BUSINESS PHOTOS
  // ==========================================

  const handlePhotosSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      let coverUrl = "";
      const galleryUrls = [];

      // Upload cover
      if (coverFile) {
        coverUrl = await uploadImage(coverFile);
      }

      // Upload work images
      for (const image of workImages) {
        const url = await uploadImage(image);
        galleryUrls.push(url);
      }

      // Save to business
      if (
        coverUrl ||
        galleryUrls.length > 0
      ) {
        const response = await fetch(
          `http://localhost:5001/api/businesses/${businessId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...(coverUrl
                ? { image: coverUrl }
                : {}),

              ...(galleryUrls.length
                ? { gallery: galleryUrls }
                : {}),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to save business photos."
          );
        }
      }

      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // SERVICES
  // ==========================================

  const updateService = (
    index,
    field,
    value
  ) => {
    const updated = [...services];

    updated[index][field] = value;

    setServices(updated);
  };

  const addServiceRow = () => {
    setServices([
      ...services,
      {
        name: "",
        duration: "",
        price: "",
        category: "",
      },
    ]);
  };

  const handleServicesSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      for (const service of services) {
        if (!service.name.trim()) continue;

        const response = await fetch(
          "http://localhost:5001/api/services",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...service,
              businessId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to add service."
          );
        }
      }

      if (selectedPlan === "team") {
        setStep(4);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // STAFF
  // ==========================================

  const updateStaff = (
    index,
    field,
    value
  ) => {
    const updated = [...staff];

    updated[index][field] = value;

    setStaff(updated);
  };

  const addStaffRow = () => {
    setStaff([
      ...staff,
      {
        name: "",
        role: "",
        phone: "",
        email: "",
        imageFile: null,
        imagePreview: "",
      },
    ]);
  };

  // ==========================================
  // STAFF PHOTO
  // ==========================================

  const handleStaffImageChange = (
    index,
    e
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid staff image."
      );
      return;
    }

    const updated = [...staff];

    updated[index].imageFile = file;
    updated[index].imagePreview =
      URL.createObjectURL(file);

    setStaff(updated);
    setError("");
  };

  // ==========================================
  // SAVE STAFF
  // ==========================================

  const handleStaffSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      for (const member of staff) {
        if (!member.name.trim()) continue;

        let imageUrl = "";

        // Upload staff image first
        if (member.imageFile) {
          imageUrl = await uploadImage(
            member.imageFile
          );
        }

        const response = await fetch(
          "http://localhost:5001/api/staff",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: member.name,
              role: member.role,
              phone: member.phone,
              email: member.email,
              businessId,
              image: imageUrl,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to add staff."
          );
        }
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };



  // ==========================================
  // STEPS
  // ==========================================

  const steps = selectedPlan === "team"
    ? ["Business Info", "Photos", "Services", "Team"]
    : ["Business Info", "Photos", "Services"];

  return (
    <div className="min-h-screen bg-[#F5F5F4] px-4 py-8 text-[#202124] sm:px-6 sm:py-12">

      <div className="mx-auto max-w-3xl">

        {/* ======================================
            BRAND
        ====================================== */}

        <div className="mb-8 text-center">

          <p className="text-xl font-bold tracking-tight text-[#202124]">
            Book
            <span className="text-[#B96882]">
              Beautiq
            </span>
          </p>

          <p className="mt-1 text-sm text-[#777472]">
            Set up your business profile
          </p>

        </div>

        {/* ======================================
            PROGRESS
        ====================================== */}

        <div className="mb-8 flex items-center">

          {steps.map((label, i) => {
            const current = i + 1;
            const completed =
              step > current;
            const active =
              step === current;

            return (
              <div
                key={label}
                className="flex flex-1 items-center"
              >

                <div className="flex flex-col items-center">

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                      completed
                        ? "bg-[#242424] text-white"
                        : active
                        ? "border-2 border-[#242424] bg-white text-[#242424]"
                        : "border border-[#D5D2CF] bg-white text-[#999]"
                    }`}
                  >
                    {completed
                      ? "✓"
                      : current}
                  </div>

                  <span
                    className={`mt-2 hidden text-[10px] font-semibold sm:block ${
                      active
                        ? "text-[#242424]"
                        : "text-[#999]"
                    }`}
                  >
                    {label}
                  </span>

                </div>

                {i <
                  steps.length - 1 && (
                  <div
                    className={`mx-2 h-px flex-1 ${
                      completed
                        ? "bg-[#242424]"
                        : "bg-[#DDD9D6]"
                    }`}
                  />
                )}

              </div>
            );
          })}

        </div>

        {/* ======================================
            CARD
        ====================================== */}

        <div className="rounded-[28px] border border-[#E2E0DE] bg-white p-5 shadow-[0_15px_50px_rgba(30,25,25,0.06)] sm:p-8 lg:p-10">

          <div className="mb-7">

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {steps[step - 1]}
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#777472]">
              {step === 1 &&
                "Tell customers about your business and add your profile photo."}

              {step === 2 &&
                "Add your business cover and showcase your best work."}

              {step === 3 &&
                "Add the services customers can book."}

              {step === 4 &&
                "Introduce the professionals working at your business."}
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ======================================
              STEP 1 — BUSINESS + OWNER PROFILE
          ====================================== */}

          {step === 1 && (
            <form
              onSubmit={handleBusinessSubmit}
              className="space-y-6"
            >

              {/* OWNER PROFILE */}

              <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-5">

                <div className="flex flex-col items-center gap-4 sm:flex-row">

                  <label className="group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#D8D5D2] bg-white">

                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl text-[#777]">
                          +
                        </div>

                        <p className="text-[10px] font-semibold text-[#777]">
                          Photo
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleProfileChange
                      }
                      className="hidden"
                    />

                  </label>

                  <div>

                    <p className="font-bold">
                      Your profile photo
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#777472]">
                      Add a photo so customers and
                      your team can recognize you.
                    </p>

                    <p className="mt-2 text-xs text-[#999]">
                      Optional — you can add it later.
                    </p>

                  </div>

                </div>

              </div>

              {/* BUSINESS INFORMATION */}

              <div className="space-y-4">

              <div className="mb-2">
  <p className="mb-3 text-sm font-semibold text-[#242424]">Choose your plan</p>
  <div className="grid gap-3 sm:grid-cols-2">
    {[
      { id: "independent", label: "Independent", price: "KES 1,500/mo" },
      { id: "team", label: "Team", price: "KES 2,500/mo" },
    ].map((plan) => (
      <button
        key={plan.id}
        type="button"
        onClick={() => setSelectedPlan(plan.id)}
        className={`rounded-2xl border p-4 text-left transition ${
          selectedPlan === plan.id
            ? "border-[#242424] bg-[#242424] text-white"
            : "border-[#DDDAD7] bg-[#FAFAF9] text-[#242424] hover:border-[#B96882]"
        }`}
      >
        <p className="font-bold">{plan.label}</p>
        <p className={`mt-1 text-sm ${selectedPlan === plan.id ? "text-white/70" : "text-gray-500"}`}>
          {plan.price}
        </p>
        <p className={`mt-2 text-xs ${selectedPlan === plan.id ? "text-white/60" : "text-gray-400"}`}>
          7 days free, then billed monthly
        </p>
      </button>
    ))}
  </div>
</div>


                <input
                  placeholder="Business Name"
                  value={businessData.name}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      name: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />

                <input
                  placeholder="Category (e.g. Hair, Spa)"
                  value={businessData.category}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      category: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />

                <input
                  placeholder="Location"
                  value={businessData.location}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      location: e.target.value,
                    })
                  }
                  className={inputClass}
                  required
                />

                <textarea
                  placeholder="Tell customers about your business..."
                  value={
                    businessData.description
                  }
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      description:
                        e.target.value,
                    })
                  }
                  rows="4"
                  className={inputClass}
                  required
                />

                <input
                  placeholder="Starting Price (e.g. KSH 2000)"
                  value={businessData.price}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      price: e.target.value,
                    })
                  }
                  className={inputClass}
                />

                <div className="grid gap-4 sm:grid-cols-2">

                  <input
                    placeholder="Phone"
                    value={businessData.phone}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        phone: e.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <input
                    type="email"
                    placeholder="Business Email"
                    value={businessData.email}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        email: e.target.value,
                      })
                    }
                    className={inputClass}
                  />

                </div>

                <input
                  placeholder="Opening Hours"
                  value={
                    businessData.openingHours
                  }
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      openingHours:
                        e.target.value,
                    })
                  }
                  className={inputClass}
                />

              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#242424] py-4 text-sm font-bold text-white transition hover:bg-[#B96882] disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : "Continue"}
              </button>

            </form>
          )}

          {/* ======================================
              STEP 2 — PHOTOS
          ====================================== */}

          {step === 2 && (
            <div className="space-y-8">

              {/* COVER */}

              <div>

                <div className="mb-3">

                  <h2 className="font-bold">
                    Business cover
                  </h2>

                  <p className="mt-1 text-sm text-[#777472]">
                    Your main business image. You can
                    change this later from your dashboard.
                  </p>

                </div>

                <label className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-dashed border-[#D4D0CD] bg-[#FAFAF9]">

                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Business cover preview"
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 flex-col items-center justify-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECEAE8] text-lg">
                        +
                      </div>

                      <p className="mt-3 text-sm font-semibold">
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
                      handleCoverChange
                    }
                    className="hidden"
                  />

                </label>

              </div>

              {/* WORK GALLERY */}

              <div>

                <div className="mb-3 flex items-end justify-between">

                  <div>

                    <h2 className="font-bold">
                      Showcase your work
                    </h2>

                    <p className="mt-1 text-sm text-[#777472]">
                      Add up to 5 photos of your best work.
                    </p>

                  </div>

                  <span className="text-xs font-semibold text-[#999]">
                    {workImages.length}/5
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                  {workPreviews.map(
                    (preview, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-2xl bg-[#F1EFED]"
                      >

                        <img
                          src={preview}
                          alt={`Work ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeWorkImage(
                              index
                            )
                          }
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                  {workImages.length < 5 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4D0CD] bg-[#FAFAF9] transition hover:border-[#AAA5A1] hover:bg-white">

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
                          handleWorkImagesChange
                        }
                        className="hidden"
                      />

                    </label>
                  )}

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-xl border border-[#D9D5D2] py-4 text-sm font-semibold text-[#666] transition hover:bg-[#F6F5F4]"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={
                    handlePhotosSubmit
                  }
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#242424] py-4 text-sm font-bold text-white transition hover:bg-[#B96882] disabled:opacity-60"
                >
                  {submitting
                    ? "Uploading..."
                    : "Save & Continue"}
                </button>

              </div>

            </div>
          )}

          {/* ======================================
              STEP 3 — SERVICES
          ====================================== */}

          {step === 3 && (
            <div className="space-y-6">

              {services.map(
                (service, i) => (
                  <div
                    key={i}
                    className="space-y-3 rounded-2xl border border-[#E4E1DE] bg-[#FAFAF9] p-4"
                  >

                    <input
                      placeholder="Service Name"
                      value={service.name}
                      onChange={(e) =>
                        updateService(
                          i,
                          "name",
                          e.target.value
                        )
                      }
                      className={inputClass}
                    />

                    <div className="grid grid-cols-2 gap-3">

                      <input
                        placeholder="Duration (mins)"
                        type="number"
                        value={
                          service.duration
                        }
                        onChange={(e) =>
                          updateService(
                            i,
                            "duration",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                      <input
                        placeholder="Price"
                        type="number"
                        value={service.price}
                        onChange={(e) =>
                          updateService(
                            i,
                            "price",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                    </div>

                    <input
                      placeholder="Category"
                      value={
                        service.category
                      }
                      onChange={(e) =>
                        updateService(
                          i,
                          "category",
                          e.target.value
                        )
                      }
                      className={inputClass}
                    />

                  </div>
                )
              )}

              <button
                type="button"
                onClick={addServiceRow}
                className="text-sm font-bold text-[#555] hover:text-[#B96882]"
              >
                + Add another service
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() => (selectedPlan === "team" ? setStep(4) : navigate("/dashboard"))}
                  className="flex-1 rounded-xl border border-[#D9D5D2] py-4 font-semibold text-[#666]"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={
                    handleServicesSubmit
                  }
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#242424] py-4 font-bold text-white transition hover:bg-[#B96882] disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : selectedPlan === "team"
                    ? "Continue"
                    : "Finish Setup"}
                </button>

              </div>

            </div>
          )}

          {/* ======================================
              STEP 4 — TEAM
          ====================================== */}

          {step === 4 && selectedPlan === "team" && (
            <div className="space-y-6">

              <div className="rounded-2xl bg-[#F5F4F3] p-4">

                <p className="text-sm font-semibold">
                  Add your team
                </p>

                <p className="mt-1 text-xs leading-5 text-[#777472]">
                  Add your professionals and optionally
                  give each person a profile photo.
                  You can manage them later from your
                  dashboard.
                </p>

              </div>

              {staff.map(
                (member, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[#E4E1DE] bg-[#FAFAF9] p-5"
                  >

                    {/* STAFF PHOTO */}

                    <div className="mb-5 flex items-center gap-4">

                      <label className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#D6D2CF] bg-white">

                        {member.imagePreview ? (
                          <img
                            src={
                              member.imagePreview
                            }
                            alt={
                              member.name ||
                              "Staff"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <span className="text-xl text-[#777]">
                              +
                            </span>

                            <p className="text-[9px] font-semibold text-[#777]">
                              Photo
                            </p>
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleStaffImageChange(
                              i,
                              e
                            )
                          }
                          className="hidden"
                        />

                      </label>

                      <div>

                        <p className="text-sm font-bold">
                          Profile photo
                        </p>

                        <p className="mt-1 text-xs text-[#888]">
                          Optional — add now or later.
                        </p>

                      </div>

                    </div>

                    <div className="space-y-3">

                      <input
                        placeholder="Staff Name"
                        value={member.name}
                        onChange={(e) =>
                          updateStaff(
                            i,
                            "name",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                      <input
                        placeholder="Role (e.g. Senior Nail Artist)"
                        value={member.role}
                        onChange={(e) =>
                          updateStaff(
                            i,
                            "role",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                      <div className="grid gap-3 sm:grid-cols-2">

                        <input
                          placeholder="Phone"
                          value={member.phone}
                          onChange={(e) =>
                            updateStaff(
                              i,
                              "phone",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />

                        <input
                          type="email"
                          placeholder="Email"
                          value={member.email}
                          onChange={(e) =>
                            updateStaff(
                              i,
                              "email",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />

                      </div>

                    </div>

                  </div>
                )
              )}

              <button
                type="button"
                onClick={addStaffRow}
                className="text-sm font-bold text-[#555] hover:text-[#B96882]"
              >
                + Add another team member
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/dashboard")
                  }
                  className="flex-1 rounded-xl border border-[#D9D5D2] py-4 font-semibold text-[#666] transition hover:bg-[#F6F5F4]"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={
                    handleStaffSubmit
                  }
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#242424] py-4 font-bold text-white transition hover:bg-[#B96882] disabled:opacity-60"
                >
                  {submitting
                    ? "Finishing..."
                    : "Finish Setup"}
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default BusinessOnboarding;
