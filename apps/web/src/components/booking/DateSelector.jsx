import { useEffect, useRef, useState } from "react";

function DateSelector({ selectedDate, setSelectedDate }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Close the calendar when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const canGoPrevious =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const handlePrevMonth = () => {
    if (!canGoPrevious) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);

    if (d < today) return;

    setSelectedDate({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate().toString(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      iso: d.toISOString().split("T")[0],
    });

    setOpen(false);
  };

  const isPastDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isSelectedDay = (day) => {
    if (!selectedDate?.iso) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d.toISOString().split("T")[0] === selectedDate.iso;
  };

  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  const displayLabel = selectedDate
    ? `${selectedDate.day}, ${selectedDate.month} ${selectedDate.date}`
    : "Select a date";

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-2 block text-sm font-semibold text-[#242424]">Date</label>

      {/* Field that opens the calendar */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] px-4 py-3.5 text-sm font-medium text-[#242424] outline-none transition hover:border-[#B96882] focus:border-[#B96882] focus:bg-white"
      >
        <span className={selectedDate ? "text-[#242424]" : "text-gray-400"}>
          {displayLabel}
        </span>
        <span className="text-gray-400">📅</span>
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#E5E2DF] bg-white p-4 shadow-lg">

          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrevious}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#242424] transition hover:bg-[#F0EBEC] disabled:cursor-not-allowed disabled:opacity-30"
            >
              ←
            </button>

            <p className="text-sm font-semibold text-[#242424]">{monthLabel}</p>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#242424] transition hover:bg-[#F0EBEC]"
            >
              →
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekdayLabels.map((label, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-400">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} />;

              const past = isPastDay(day);
              const selected = isSelectedDay(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={past}
                  onClick={() => handleSelectDay(day)}
                  className={`aspect-square rounded-lg text-sm font-medium transition ${
                    selected
                      ? "bg-[#242424] text-white"
                      : past
                      ? "cursor-not-allowed text-gray-300"
                      : "text-[#242424] hover:bg-[#F0EBEC]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

export default DateSelector;
