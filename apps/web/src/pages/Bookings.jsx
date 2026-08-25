import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5001/api/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load bookings.");
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF8FB] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-[#1F2937]">My Bookings</h1>

          {loading && <p className="mt-8 text-gray-500">Loading...</p>}
          {error && <p className="mt-8 text-red-500">{error}</p>}
          {!loading && !error && bookings.length === 0 && (
            <p className="mt-8 text-gray-500">You have no bookings yet.</p>
          )}

          <div className="mt-8 space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">{b.businessId?.name}</h3>
                <p className="text-gray-500">{b.service} with {b.staff}</p>
                <p className="text-gray-500">{b.date} at {b.time}</p>
                <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Bookings;
