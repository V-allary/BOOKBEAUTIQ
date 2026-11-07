import { getEffectivePrice, getTotals, isOnOffer, MAX_SERVICES } from "../../utils/servicePricing";

function ServiceSelector({
  services = [],
  selectedServices = [],
  setSelectedServices,
  loading,
}) {
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

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-semibold text-[#242424]">
          Services
        </label>
        <span className="text-xs text-gray-400">
          Choose up to {MAX_SERVICES} · {selectedServices.length}/{MAX_SERVICES}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading services...</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-gray-400">No services available</p>
      ) : (
        <div className="space-y-2">
          {services.map((s) => {
            const selected = selectedServices.some((x) => x._id === s._id);
            const locked = !selected && atLimit;
            const offer = isOnOffer(s);

            return (
              <button
                key={s._id}
                type="button"
                onClick={() => toggle(s)}
                disabled={locked}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
                  selected
                    ? "border-[#242424] bg-[#F5F4F2]"
                    : "border-[#DDDAD7] bg-[#FAFAF9] hover:border-[#B96882]"
                } ${locked ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                    selected
                      ? "border-[#242424] bg-[#242424] text-white"
                      : "border-[#C9C5C2] bg-white text-transparent"
                  }`}
                >
                  ✓
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#242424]">
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
      )}

      {selectedServices.length > 1 && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F7EEF1] px-4 py-3 text-sm">
          <span className="text-gray-600">
            {selectedServices.length} services · {totals.duration} mins
          </span>
          <span className="font-bold text-[#B96882]">KES {totals.price}</span>
        </div>
      )}

      {atLimit && (
        <p className="mt-2 text-xs text-gray-400">
          You can book up to {MAX_SERVICES} services at a time.
        </p>
      )}
    </div>
  );
}

export default ServiceSelector;
