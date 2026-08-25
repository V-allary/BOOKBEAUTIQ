import { useMemo } from "react";

function TimeSlots({ selectedTime, setSelectedTime }) {
  const slots = useMemo(() => {
    const result = [];
    let hour = 9;
    let minute = 0;

    while (hour < 20) {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      const displayMinute = minute === 0 ? "00" : minute;
      result.push(`${displayHour}:${displayMinute} ${period}`);

      minute += 30;
      if (minute === 60) {
        minute = 0;
        hour += 1;
      }
    }

    return result;
  }, []);

  return (
    <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-[#242424]">Select a Time</h2>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot}
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
    </div>
  );
}

export default TimeSlots;
