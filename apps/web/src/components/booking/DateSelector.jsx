import { useMemo } from "react";

function DateSelector({ selectedDate, setSelectedDate }) {
  const dates = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.getDate().toString(),
        month: d.toLocaleDateString("en-US", { month: "short" }),
        fullDate: d.toISOString().split("T")[0],
      });
    }

    return days;
  }, []);

  return (
    <div className="mt-8 rounded-2xl border border-[#E5E2DF] bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-bold text-[#242424]">Select a Date</h2>
      <p className="mb-5 text-sm text-gray-400">Book up to 30 days ahead</p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {dates.map((item) => (
          <button
            key={item.fullDate}
            onClick={() => setSelectedDate(item)}
            className={`flex min-w-[76px] shrink-0 flex-col items-center rounded-xl border px-4 py-3 transition ${
              selectedDate?.fullDate === item.fullDate
                ? "border-[#242424] bg-[#242424] text-white"
                : "border-[#E5E2DF] bg-[#FAFAF9] text-[#242424] hover:border-[#B96882]"
            }`}
          >
            <span className={`text-xs font-semibold ${selectedDate?.fullDate === item.fullDate ? "text-white/70" : "text-gray-400"}`}>
              {item.month}
            </span>
            <span className="mt-1 text-xl font-bold">{item.date}</span>
            <span className={`mt-0.5 text-xs ${selectedDate?.fullDate === item.fullDate ? "text-white/70" : "text-gray-400"}`}>
              {item.day}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DateSelector;
