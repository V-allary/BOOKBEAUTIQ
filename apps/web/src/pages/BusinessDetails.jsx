import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import BookingCard from "../components/booking/BookingCard";
import BookingSummary from "../components/booking/BookingSummary";

function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectorsLoading, setSelectorsLoading] = useState(true);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [socialOpen, setSocialOpen] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("/uploads/") ? `http://localhost:5001${path}` : path;
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/businesses/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load business.");
        setBusiness(data);
      } catch (err) {
        setError(err.message || "Unable to load business.");
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchServicesAndStaff = async () => {
      try {
        const [servicesRes, staffRes] = await Promise.all([
          fetch(`http://localhost:5001/api/services?businessId=${id}`),
          fetch(`http://localhost:5001/api/staff?businessId=${id}`),
        ]);
        setServices(await servicesRes.json());
        setStaff(await staffRes.json());
      } catch (err) {
        console.error("Error loading services/staff:", err);
      } finally {
        setSelectorsLoading(false);
      }
    };
    fetchServicesAndStaff();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5001/api/reviews/business/${id}`)
      .then((res) => res.json())
      .then(setReviews)
      .catch((err) => console.error("Error loading reviews:", err));
  }, [id]);

  const handleContinueToCheckout = () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      alert("Please select a service, professional, date, and time.");
      return;
    }
    navigate("/checkout", {
      state: { business, selectedService, selectedStaff, selectedDate, selectedTime },
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F7F7F6] px-6 py-20">
          <div className="mx-auto max-w-7xl rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">Loading business...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !business) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F7F7F6] px-6 py-20">
          <div className="mx-auto max-w-7xl rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">😕</div>
            <h1 className="mt-4 text-2xl font-bold text-[#242424]">Business not found</h1>
            <p className="mt-2 text-gray-500">{error || "This business could not be found."}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const coverUrl = business.image ? getImageUrl(business.image) : "";


  const galleryUrls = Array.isArray(business.gallery) ? business.gallery.map(getImageUrl) : [];

  const hasSocial = business.instagramUrl || business.tiktokUrl;

  const mapQuery = encodeURIComponent(`${business.name} ${business.location}`);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F7F7F6]">

                 {/* Cover Image */}
        <section className="mx-auto max-w-7xl px-6 pt-10">
          <div className="h-[420px] overflow-hidden rounded-2xl bg-[#F1EFED]">
            {coverUrl ? (
              <img src={coverUrl} alt={business.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-[#D8D4D1]">
                {business.name?.charAt(0)?.toUpperCase() || "B"}
              </div>
            )}
          </div>
        </section>


        {/* Business Info */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-5xl font-bold text-[#242424]">{business.name}</h1>
              <p className="mt-3 text-lg text-gray-500">📍 {business.location}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-[#F2E8EC] px-4 py-2 font-semibold text-[#9D536D]">
                  ⭐ {business.rating || 5}
                </span>
                <span className="text-gray-500">{business.category}</span>
              </div>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 900, behavior: "smooth" })}
              className="rounded-xl bg-[#242424] px-8 py-4 font-semibold text-white transition hover:bg-[#B96882]"
            >
              Book Appointment
            </button>
          </div>
        </section>

        {/* Main Content */}
        <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 lg:grid-cols-3">

          <div className="lg:col-span-2">

            {/* 1. About */}
            <div className="rounded-2xl border border-[#E5E2DF] bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#242424]">About</h2>
              <p className="leading-8 text-gray-600">{business.description}</p>
            </div>

            <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-[#242424]">Business Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-[#E5E2DF] pb-4">
                  <span className="text-gray-500">Category</span>
                  <span className="font-semibold text-[#242424]">{business.category}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E2DF] pb-4">
                  <span className="text-gray-500">Opening Hours</span>
                  <span className="font-semibold text-[#242424]">{business.openingHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Starting Price</span>
                  <span className="font-semibold text-[#B96882]">{business.price}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-[#242424]">Services</h2>
              {services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((s) => (
                    <div key={s._id} className="flex justify-between border-b border-[#E5E2DF] pb-4 last:border-b-0">
                      <span className="font-semibold text-[#242424]">{s.name}</span>
                      <span className="text-gray-500">KES {s.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Services will be available soon.</p>
              )}
            </div>

             {/* 2. Booking Flow — single consolidated card */}
<div className="mt-8">
  <BookingCard
    services={services}
    staff={staff}
    selectorsLoading={selectorsLoading}
    selectedService={selectedService}
    setSelectedService={setSelectedService}
    selectedStaff={selectedStaff}
    setSelectedStaff={setSelectedStaff}
    selectedDate={selectedDate}
    setSelectedDate={setSelectedDate}
    selectedTime={selectedTime}
    setSelectedTime={setSelectedTime}
  />
</div>
        {/* 3. SEE OUR WORK */}
{hasSocial && (
  <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5E2DF] bg-white shadow-sm">

    {/* Header */}
    <div className="border-b border-[#E5E2DF] px-8 py-6">

      <p className="text-xs font-bold uppercase tracking-[2px] text-[#B96882]">
        See Our Work
      </p>

      <h2 className="mt-2 text-2xl font-bold text-[#242424]">
        Follow their latest work
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
        Explore their work and get a feel for their style before
        booking your appointment.
      </p>

    </div>

    {/* Social buttons */}
    <div className="grid gap-4 p-6 sm:grid-cols-2">

      {/* Instagram */}
      {business.instagramUrl && (
        <button
          type="button"
          onClick={() => setSocialOpen("instagram")}
          className="group flex items-center justify-between rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[#B96882] hover:bg-white hover:shadow-md"
        >

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F2E8EC] text-xl text-[#9D536D]">
              ◎
            </div>

            <div>
              <p className="font-semibold text-[#242424]">
                Instagram
              </p>

              <p className="mt-1 text-xs text-gray-500">
                View their work
              </p>
            </div>

          </div>

          <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#B96882]">
            →
          </span>

        </button>
      )}

      {/* TikTok */}
      {business.tiktokUrl && (
        <button
          type="button"
          onClick={() => setSocialOpen("tiktok")}
          className="group flex items-center justify-between rounded-2xl border border-[#E5E2DF] bg-[#FAF9F8] p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[#B96882] hover:bg-white hover:shadow-md"
        >

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F1EF] text-xl text-[#242424]">
              ♪
            </div>

            <div>
              <p className="font-semibold text-[#242424]">
                TikTok
              </p>

              <p className="mt-1 text-xs text-gray-500">
                View their videos
              </p>
            </div>

          </div>

          <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#B96882]">
            →
          </span>

        </button>
      )}

    </div>

    {/* In-site Social Modal */}
    {socialOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
        onClick={() => setSocialOpen(null)}
      >

        <div
          className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[#E5E2DF] px-6 py-5">

            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#B96882]">
                {socialOpen === "instagram"
                  ? "Instagram"
                  : "TikTok"}
              </p>

              <h3 className="mt-1 text-xl font-bold text-[#242424]">
                {business.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setSocialOpen(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F4F2] text-lg text-[#555] transition hover:bg-[#F2E8EC] hover:text-[#9D536D]"
              aria-label="Close"
            >
              ×
            </button>

          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6">

            {/* Instagram */}
            {socialOpen === "instagram" && (
              <div>

                <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-6 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2E8EC] text-2xl text-[#9D536D]">
                    ◎
                  </div>

                  <h4 className="mt-5 text-lg font-bold text-[#242424]">
                    {business.name} on Instagram
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Explore their latest work through the portfolio
                    they've shared with BookBeautiq.
                  </p>

                </div>

                {/* BookBeautiq Gallery */}
                {galleryUrls.length > 0 ? (
                  <div className="mt-6">

                    <div className="mb-4 flex items-end justify-between">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[2px] text-[#B96882]">
                          Their work
                        </p>

                        <h4 className="mt-1 text-xl font-bold text-[#242424]">
                          Latest portfolio
                        </h4>
                      </div>

                      <span className="text-xs text-gray-400">
                        {galleryUrls.length} photos
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                      {galleryUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="aspect-square overflow-hidden rounded-2xl bg-[#F1EFED]"
                        >
                          <img
                            src={url}
                            alt={`${business.name} work ${index + 1}`}
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />
                        </div>
                      ))}

                    </div>

                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-[#E5E2DF] bg-white p-8 text-center">

                    <p className="text-sm text-gray-500">
                      This business hasn't added portfolio images
                      to BookBeautiq yet.
                    </p>

                  </div>
                )}

              </div>
            )}

            {/* TikTok */}
            {socialOpen === "tiktok" && (
              <div>

                <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-6 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F1EF] text-2xl text-[#242424]">
                    ♪
                  </div>

                  <h4 className="mt-5 text-lg font-bold text-[#242424]">
                    {business.name} on TikTok
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    See more of this professional's work through
                    their BookBeautiq portfolio.
                  </p>

                </div>

                {/* BookBeautiq Gallery */}
                {galleryUrls.length > 0 ? (
                  <div className="mt-6">

                    <div className="mb-4">

                      <p className="text-xs font-bold uppercase tracking-[2px] text-[#B96882]">
                        Their work
                      </p>

                      <h4 className="mt-1 text-xl font-bold text-[#242424]">
                        Latest portfolio
                      </h4>

                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                      {galleryUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="aspect-square overflow-hidden rounded-2xl bg-[#F1EFED]"
                        >
                          <img
                            src={url}
                            alt={`${business.name} work ${index + 1}`}
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />
                        </div>
                      ))}

                    </div>

                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-[#E5E2DF] bg-white p-8 text-center">

                    <p className="text-sm text-gray-500">
                      This business hasn't added portfolio images
                      to BookBeautiq yet.
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
)}
 
            {/* 4. Gallery */}
            {galleryUrls.length > 0 && (
              <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-white p-8 shadow-sm">
                <h2 className="mb-5 text-2xl font-bold text-[#242424]">Gallery</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryUrls.map((url, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-xl bg-[#F1EFED]">
                      <img src={url} alt={`Work ${i + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Reviews */}
            <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-[#242424]">Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-[#E5E2DF] pb-4 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#242424]">{r.customerName}</span>
                        <span className="text-[#B96882]">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      </div>
                      {r.comment && <p className="mt-2 text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Location Map */}
            <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-white p-8 shadow-sm">
              <h2 className="mb-5 text-2xl font-bold text-[#242424]">Location</h2>
              <p className="mb-4 text-gray-500">📍 {business.location}</p>
              <div className="overflow-hidden rounded-xl border border-[#E5E2DF]">
                <iframe
                  title="Business location"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                />
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div>
            <BookingSummary
              selectedService={selectedService}
              selectedStaff={selectedStaff}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onContinue={handleContinueToCheckout}
            />
          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default BusinessDetails;
