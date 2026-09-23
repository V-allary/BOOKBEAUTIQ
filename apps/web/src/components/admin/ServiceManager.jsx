import { useEffect, useState } from "react";
import { API_URL } from "../../config";

function ServiceManager({ businesses }) {
  const [services, setServices] = useState([]);
  const token = localStorage.getItem("token");

  const [editingServiceId, setEditingServiceId] = useState(null);

  const emptyForm = {
    businessId: businesses[0]?._id || "",
    name: "",
    description: "",
    durationHours: "",
    durationMinutes: "",
    price: "",
    category: "",
    discountEnabled: false,
    discountPrice: "",
    discountLabel: "",
    discountStartDate: "",
    discountEndDate: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const fetchServices = async () => {
    try {
      const businessId = formData.businessId || businesses[0]?._id;
      const url = businessId
        ? `${API_URL}/api/services?businessId=${businessId}`
        : `${API_URL}/api/services`;

      const response = await fetch(url);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [formData.businessId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // ==========================================
  // START EDITING AN EXISTING SERVICE
  // ==========================================

  const handleEditClick = (service) => {
    setEditingServiceId(service._id);

    const totalMinutes = Number(service.duration) || 0;

    setFormData({
      businessId: service.businessId || formData.businessId,
      name: service.name || "",
      description: service.description || "",
      durationHours: String(Math.floor(totalMinutes / 60)),
      durationMinutes: String(totalMinutes % 60),
      price: service.price ?? "",
      category: service.category || "",
      discountEnabled: !!service.discountPrice,
      discountPrice: service.discountPrice ?? "",
      discountLabel: service.discountLabel || "",
      discountStartDate: service.discountStartDate
        ? service.discountStartDate.slice(0, 10)
        : "",
      discountEndDate: service.discountEndDate
        ? service.discountEndDate.slice(0, 10)
        : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
    setFormData({ ...emptyForm, businessId: businesses[0]?._id || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const totalDurationMinutes =
        (Number(formData.durationHours) || 0) * 60 +
        (Number(formData.durationMinutes) || 0);

      const payload = {
        businessId: formData.businessId,
        name: formData.name,
        description: formData.description,
        duration: totalDurationMinutes,
        price: formData.price,
        category: formData.category,
        discountPrice: formData.discountEnabled && formData.discountPrice ? formData.discountPrice : null,
        discountLabel: formData.discountEnabled ? formData.discountLabel : "",
        discountStartDate: formData.discountEnabled && formData.discountStartDate ? formData.discountStartDate : null,
        discountEndDate: formData.discountEnabled && formData.discountEndDate ? formData.discountEndDate : null,
      };

      const isEditing = !!editingServiceId;

      const response = await fetch(
        isEditing
          ? `${API_URL}/api/services/${editingServiceId}`
          : `${API_URL}/api/services`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || (isEditing ? "Failed to update service." : "Failed to create service")
        );
      }

      alert(isEditing ? "Service updated successfully!" : "Service added successfully!");

      handleCancelEdit();
      fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      const response = await fetch(`${API_URL}/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete service.");

      if (editingServiceId === id) {
        handleCancelEdit();
      }

      fetchServices();
    } catch (error) {
      alert(error.message);
    }
  };  

  const isDiscountActive = (service) => {
    if (!service.discountPrice) return false;
    const now = new Date();
    if (service.discountStartDate && new Date(service.discountStartDate) > now) return false;
    if (service.discountEndDate && new Date(service.discountEndDate) < now) return false;
    return true;
  };

  const formatDuration = (totalMinutes) => {
    const minutes = Number(totalMinutes) || 0;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} mins`;
    if (remainingMinutes === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
    return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMinutes} mins`;
  };

  return (
    <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="mb-8 text-3xl font-bold text-[#14171A]">
        Services
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {editingServiceId && (
          <div className="flex items-center justify-between rounded-xl bg-[#F2E8EC] px-4 py-3">
            <p className="text-sm font-semibold text-[#9D536D]">
              Editing {formData.name || "service"}
            </p>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-sm font-semibold text-[#9D536D] underline"
            >
              Cancel
            </button>
          </div>
        )}

        {businesses.length > 1 && (
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Select Business
            </label>

            <select
              name="businessId"
              value={formData.businessId}
              onChange={handleChange}
              className="w-full rounded-xl border p-4"
              required
            >
              <option value="">Choose a Business</option>
              {businesses.map((business) => (
                <option key={business._id} value={business._id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Service Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-xl border p-4"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-xl border p-4"
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Duration
          </label>

          <div className="grid grid-cols-2 gap-3">

            <div>
              <input
                type="number"
                name="durationHours"
                placeholder="0"
                min="0"
                value={formData.durationHours}
                onChange={handleChange}
                className="w-full rounded-xl border p-4"
              />
              <p className="mt-1 text-xs text-gray-400">Hours</p>
            </div>

            <div>
              <input
                type="number"
                name="durationMinutes"
                placeholder="0"
                min="0"
                max="59"
                value={formData.durationMinutes}
                onChange={handleChange}
                className="w-full rounded-xl border p-4"
              />
              <p className="mt-1 text-xs text-gray-400">Minutes</p>
            </div>

          </div>
        </div>

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full rounded-xl border p-4"
          required
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          className="w-full rounded-xl border p-4"
        />

        {/* DISCOUNT / PROMOTION */}
        <div className="rounded-2xl border border-[#E5DDE0] bg-[#FAF7F8] p-5">

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="discountEnabled"
              checked={formData.discountEnabled}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-[#B96882] focus:ring-[#B96882]"
            />
            <span className="font-semibold text-[#242424]">Add a special offer for this service</span>
          </label>

          {formData.discountEnabled && (
            <div className="mt-4 space-y-3">

              <input
                type="number"
                name="discountPrice"
                placeholder="Offer Price"
                value={formData.discountPrice}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E5DDE0] bg-white p-4"
              />

              <input
                type="text"
                name="discountLabel"
                placeholder="Offer Label (e.g. Holiday Special, Black Friday)"
                value={formData.discountLabel}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E5DDE0] bg-white p-4"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Starts (optional)</label>
                  <input
                    type="date"
                    name="discountStartDate"
                    value={formData.discountStartDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E5DDE0] bg-white p-3.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Ends (optional)</label>
                  <input
                    type="date"
                    name="discountEndDate"
                    value={formData.discountEndDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E5DDE0] bg-white p-3.5"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Leave dates empty to run the offer indefinitely until you turn it off.
              </p>

            </div>
          )}

        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#242424] py-4 font-semibold text-white transition hover:bg-[#B96882]"
        >
          {editingServiceId ? "Save Changes" : "Add Service"}
        </button>

      </form>

      <div className="mt-10 space-y-4">

        {services.map((service) => {
          const onOffer = isDiscountActive(service);

          return (
            <div
              key={service._id}
              className="flex items-center justify-between rounded-2xl border border-[#ECE9E6] p-5"
            >
    <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">
                    {service.name}
                  </h3>

                  {onOffer && (
                    <span className="rounded-full bg-[#F2E8EC] px-3 py-1 text-xs font-bold text-[#9D536D]">
                      {service.discountLabel || "Special Offer"}
                    </span>
                  )}
                </div>

                <p className="text-gray-500">
                  {service.description}
                </p>

                <div className="mt-3 flex items-center gap-6 text-sm">
                  <span>⏱ {formatDuration(service.duration)}</span>

                  {onOffer ? (
                    <span className="flex items-center gap-2">
                      <span className="text-gray-400 line-through">KES {service.price}</span>
                      <span className="font-bold text-[#B96882]">KES {service.discountPrice}</span>
                    </span>
                  ) : (
                    <span>KES {service.price}</span>
                  )}

                  <span>{service.category}</span>
                </div>
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => handleEditClick(service)}
                  className="rounded-xl border border-[#E5E2DF] px-4 py-2 text-sm font-semibold text-[#242424] hover:border-[#B96882] hover:text-[#B96882]"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(service._id)}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Delete
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default ServiceManager;