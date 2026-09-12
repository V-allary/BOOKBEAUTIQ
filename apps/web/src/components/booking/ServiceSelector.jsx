function ServiceSelector({ services = [], selectedService, setSelectedService, loading }) {
  const now = new Date();

  const selectClass =
    "w-full appearance-none rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] px-4 py-3.5 text-sm font-medium text-[#242424] outline-none transition focus:border-[#B96882] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#242424]">Service</label>
      <div className="relative">
        <select
          value={selectedService?._id || ""}
          onChange={(e) => {
            const service = services.find((s) => s._id === e.target.value);
            setSelectedService(service || null);
          }}
          disabled={loading || services.length === 0}
          className={selectClass}
        >
          <option value="">
            {loading ? "Loading services..." : services.length === 0 ? "No services available" : "Select a service"}
          </option>
          {services.map((s) => {
            const onOffer =
              s.discountPrice &&
              (!s.discountStartDate || new Date(s.discountStartDate) <= now) &&
              (!s.discountEndDate || new Date(s.discountEndDate) >= now);

            return (
              <option key={s._id} value={s._id}>
                {s.name} — KES {onOffer ? s.discountPrice : s.price} ({s.duration} mins){onOffer ? " · Special Offer" : ""}
              </option>
            );
          })}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
      </div>
    </div>
  );
}

export default ServiceSelector;
