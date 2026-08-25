import { useMemo } from "react";

function BookingCard({
  services,
  staff,
  selectorsLoading,
  selectedService,
  setSelectedService,
  selectedStaff,
  setSelectedStaff,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}) {
  const timeGroups = useMemo(() => {
    const build = (startHour, endHour) => {
      const slots = [];
      let hour = startHour;
      let minute = 0;
      while (hour < endHour) {
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour;
        const displayMinute = minute === 0 ? "00" : minute;
        slots.push(`${displayHour}:${displayMinute} ${period}`);
        minute += 30;
        if (minute === 60) {
          minute = 0;
          hour += 1;
        }
      }
      return slots;
    };

    return {
      Morning: build(9, 12),
      Afternoon: build(12, 17),
      Evening: build(17, 20),
    };
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const selectClass =
    "w-full appearance-none rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] px-4 py-3.5 text-sm font-medium text-[#242424] outline-none transition focus:border-[#B96882] focus:bg-white";

  const formatDateForSummary = (isoDate) => {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate().toString(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  };

  return (
    <div className="rounded-2xl border border-[#E5E2DF] bg-white p-7 shadow-sm">
      <h2 className="text-lg font-bold text-[#242424]">Book Your Appointment</h2>
      <p className="mt-1 text-sm text-gray-400">Choose your service, professional, date and time</p>

      <div className="mt-6 space-y-5">

        {/* Service */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#242424]">Service</label>
          <div className="relative">
            <select
              value={selectedService?._id || ""}
              onChange={(e) => {
                const service = services.find((s) => s._id === e.target.value);
                setSelectedService(service || null);
              }}
              disabled={selectorsLoading || services.length === 0}
              className={selectClass}
            >
              <option value="">
                {selectorsLoading ? "Loading services..." : services.length === 0 ? "No services available" : "Select a service"}
              </option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — KES {s.price} ({s.duration} mins)
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
          </div>
        </div>

        {/* Staff */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#242424]">Professional</label>
          <div className="relative">
            <select
              value={selectedStaff?._id || ""}
              onChange={(e) => {
                const member = staff.find((s) => s._id === e.target.value);
                setSelectedStaff(member || null);
              }}
              disabled={selectorsLoading || staff.length === 0}
              className={selectClass}
            >
              <option value="">
                {selectorsLoading ? "Loading professionals..." : staff.length === 0 ? "No professionals available" : "Select a professional"}
              </option>
              {staff.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — {s.role}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
          </div>
        </div>

        {/* Date + Time */}
        <div className="grid gap-5 sm:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#242424]">Date</label>
            <input
              type="date"
              min={today}
              value={selectedDate?.iso || ""}
              onChange={(e) => {
                const iso = e.target.value;
                setSelectedDate(iso ? { iso, ...formatDateForSummary(iso) } : null);
              }}
              className={selectClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#242424]">Time</label>
            <div className="relative">
              <select
                value={selectedTime || ""}
                onChange={(e) => setSelectedTime(e.target.value)}
                className={selectClass}
              >
                <option value="">Select a time</option>
                {Object.entries(timeGroups).map(([label, slots]) => (
                  <optgroup key={label} label={label}>
                    {slots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default BookingCard;
