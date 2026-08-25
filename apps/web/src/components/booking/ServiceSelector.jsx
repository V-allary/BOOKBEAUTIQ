function ServiceSelector({ services = [], selectedService, setSelectedService, loading }) {
  if (loading) return <div className="rounded-3xl bg-white p-8 shadow-sm">Loading services...</div>;
  if (services.length === 0) return <div className="rounded-3xl bg-white p-8 shadow-sm text-gray-500">No services available yet.</div>;

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">Choose a Service</h2>
      <div className="space-y-4">
        {services.map((service) => (
          <button
            key={service._id}
            onClick={() => setSelectedService(service)}
            className={`flex w-full items-center justify-between rounded-2xl border p-5 transition ${
              selectedService?._id === service._id
                ? "border-[#D97CA5] bg-[#FFF5F9]"
                : "border-pink-100 hover:border-[#D97CA5] hover:bg-[#FFF5F9]"
            }`}
          >
            <div className="text-left">
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-gray-500">{service.duration} mins</p>
            </div>
            <span className="font-bold text-[#D97CA5]">AED {service.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export default ServiceSelector;

 