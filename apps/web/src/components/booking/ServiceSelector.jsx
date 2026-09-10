function ServiceSelector({ services = [], selectedService, setSelectedService, loading }) {
  if (loading) return <div className="rounded-3xl bg-white p-8 shadow-sm text-gray-500">Loading services...</div>;
  if (services.length === 0) return <div className="rounded-3xl bg-white p-8 shadow-sm text-gray-500">No services available yet.</div>;

  const now = new Date();

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-[#242424]">Choose a Service</h2>
      <div className="space-y-4">
        {services.map((service) => {
          const onOffer =
            service.discountPrice &&
            (!service.discountStartDate || new Date(service.discountStartDate) <= now) &&
            (!service.discountEndDate || new Date(service.discountEndDate) >= now);

          return (
            <button
              key={service._id}
              type="button"
              onClick={() => setSelectedService(service)}
              className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                selectedService?._id === service._id
                  ? "border-[#B96882] bg-[#FFF5F9]"
                  : "border-[#E5E2DF] hover:border-[#B96882] hover:bg-[#FFF5F9]"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#242424]">{service.name}</h3>

                  {onOffer && (
                    <span className="rounded-full bg-[#F2E8EC] px-2.5 py-0.5 text-[10px] font-bold text-[#9D536D]">
                      {service.discountLabel || "Special Offer"}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500">{service.duration} mins</p>
              </div>

              {onOffer ? (
                <span className="flex flex-col items-end">
                  <span className="text-xs text-gray-400 line-through">KES {service.price}</span>
                  <span className="font-bold text-[#B96882]">KES {service.discountPrice}</span>
                </span>
              ) : (
                <span className="font-bold text-[#B96882]">KES {service.price}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ServiceSelector;
