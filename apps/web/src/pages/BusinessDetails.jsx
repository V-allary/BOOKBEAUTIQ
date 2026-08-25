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

  const coverUrl = business.image
    ? getImageUrl(business.image)
    : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600";

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
            <img src={coverUrl} alt={business.name} className="h-full w-full object-cover" />
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

            {/* 3. Social Media */}
            {hasSocial && (
              <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-white p-8 shadow-sm">
                <h2 className="mb-5 text-2xl font-bold text-[#242424]">Follow Us</h2>
                <div className="flex flex-wrap gap-3">
                  {business.instagramUrl && (
                    <a
                      href={business.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-[#E5E2DF] px-5 py-3 text-sm font-semibold text-[#242424] transition hover:border-[#B96882] hover:text-[#B96882]"
                    >
                      Instagram
                    </a>
                  )}
                  {business.tiktokUrl && (
                    <a
                      href={business.tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-[#E5E2DF] px-5 py-3 text-sm font-semibold text-[#242424] transition hover:border-[#B96882] hover:text-[#B96882]"
                    >
                      TikTok
                    </a>
                  )}
                </div>
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
