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

  const selectClass =
    "w-full appearance-none rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] px-4 py-3.5 text-sm font-medium text-[#242424] outline-none transition focus:border-[#B96882] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";

  const placeholder = !selectedDate
    ? "Select a date first"
    : loading
    ? "Checking availability..."
    : closed
    ? "Business closed on this day"
    : slots.length === 0
    ? "No available times"
    : "Select a time";

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#242424]">Time</label>
      <div className="relative">
        <select
          value={selectedTime || ""}
          onChange={(e) => setSelectedTime(e.target.value)}
          disabled={!selectedDate || loading || closed || slots.length === 0}
          className={selectClass}
        >
          <option value="">{placeholder}</option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
      </div>
    </div>
  );
}

export default TimeSlots;
