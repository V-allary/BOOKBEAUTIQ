import { useEffect, useState } from "react";
import { API_URL } from "../../config";

function TimeSlots({ businessId, selectedDate, serviceDuration, selectedStaff, selectedTime, setSelectedTime }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!businessId || !selectedDate?.iso) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      setClosed(false);

      try {
        const params = new URLSearchParams({
          businessId,
          date: selectedDate.iso,
          duration: serviceDuration || 60,
        });

        if (selectedStaff?.name) {
          params.set("staff", selectedStaff.name);
        }

        const response = await fetch(`${API_URL}/api/bookings/availability?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setSlots(data.slots || []);
          setClosed(data.closed || false);
        } else {
          setSlots([]);
        }
      } catch (error) {
        console.error("Error loading availability:", error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [businessId, selectedDate?.iso, serviceDuration, selectedStaff?.name]);

  if (!selectedDate) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-[#242424]">Select a Time</h2>

      {loading && (
        <p className="text-sm text-gray-400">Checking availability...</p>
      )}

      {!loading && closed && (
        <p className="text-sm text-gray-500">This business is closed on this day.</p>
      )}

      {!loading && !closed && slots.length === 0 && (
        <p className="text-sm text-gray-500">No available times on this day. Please try another date.</p>
      )}

      {!loading && !closed && slots.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedTime(slot)}
              className={`rounded-xl border py-3 text-sm font-semibold transition ${
                selectedTime === slot
                  ? "border-[#242424] bg-[#242424] text-white"
                  : "border-[#E5E2DF] bg-[#FAFAF9] text-[#242424] hover:border-[#B96882]"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TimeSlots;
