import { useEffect, useRef, useState } from "react";
import { getEffectivePrice, getTotals, isOnOffer, MAX_SERVICES } from "../../utils/servicePricing";

function ServiceSelector({
  services = [],
  selectedServices = [],
  setSelectedServices,
  loading,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close the list when clicking outside it or pressing Escape
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const toggle = (service) => {
    const isSelected = selectedServices.some((s) => s._id === service._id);

    if (isSelected) {
      setSelectedServices(selectedServices.filter((s) => s._id !== service._id));
    } else if (selectedServices.length < MAX_SERVICES) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totals = getTotals(selectedServices);
  const atLimit = selectedServices.length >= MAX_SERVICES;
  const disabled = loading || services.length === 0;

  const buttonText = loading
    ? "Loading services..."
    : services.length === 0
    ? "No services available"
    : selectedServices.length === 0
    ? "Select up to 3 services"
    : selectedServices.map((s) => s.name).join(", ");

  return (
    <div ref={wrapperRef}>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-semibold text-[#242424]">
          Services
        </label>
        <span className="text-xs text-gray-400">
          {selectedServices.length}/{MAX_SERVICES} selected
        </span>
      </div>

      <div className="relative">
        {/* Looks like the Time dropdown */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`w-full rounded-xl border bg-[#FAFAF9] px-4 py-3.5 pr-10 text-left text-sm font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
            open ? "border-[#B96882] bg-white" : "border-[#DDDAD7]"
          } ${selectedServices.length === 0 ? "text-gray-400" : "text-[#242424]"}`}
        >
          <span className="block truncate">{buttonText}</span>
        </button>

        <span
          className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>

        {open && !disabled && (
          <div
            role="listbox"
            aria-multiselectable="true"
            className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-[#E5E2DF] bg-white shadow-[0_12px_40px_rgba(20,23,26,0.12)]"
          >
            <div className="max-h-72 overflow-y-auto py-1">
              {services.map((s) => {
                const selected = selectedServices.some((x) => x._id === s._id);
                const locked = !selected && atLimit;
                const offer = isOnOffer(s);

                return (
                  <button
                    key={s._id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(s)}
                    disabled={locked}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      selected ? "bg-[#F7EEF1]" : "hover:bg-[#F7F6F5]"
                    } ${locked ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                        selected
                          ? "border-[#B96882] bg-[#B96882] text-white"
                          : "border-[#C9C5C2] bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#242424]">
                        {s.name}
                        {offer && (
                          <span className="ml-2 rounded-full bg-[#F2E8EC] px-2 py-0.5 text-[10px] font-bold text-[#9D536D]">
                            {s.discountLabel || "Special Offer"}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-400">
                        {s.duration} mins
                      </span>
                    </span>

                    <span className="shrink-0 text-right text-sm font-semibold text-[#242424]">
                      {offer && (
                        <span className="mr-2 text-xs font-normal text-gray-400 line-through">
                          KES {s.price}
                        </span>
                      )}
                      KES {getEffectivePrice(s)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[#ECE9E6] bg-[#FAFAF9] px-4 py-3">
              <span className="text-xs text-gray-400">
                {atLimit
                  ? `Maximum of ${MAX_SERVICES} services`
                  : `Choose up to ${MAX_SERVICES}`}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#242424] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#B96882]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedServices.length > 1 && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F7EEF1] px-4 py-3 text-sm">
          <span className="text-gray-600">
            {selectedServices.length} services · {totals.duration} mins
          </span>
          <span className="font-bold text-[#B96882]">KES {totals.price}</span>
        </div>
      )}
    </div>
  );
}

export default ServiceSelector;
