import { useEffect, useState } from "react";

function ServiceManager({ businesses }) {
  const [services, setServices] = useState([]);
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    businessId: businesses[0]?._id || "",
    name: "",
    description: "",
    duration: "",
    price: "",
    category: "",
  });

  const fetchServices = async () => {
    try {
      const businessId = formData.businessId || businesses[0]?._id;
      const url = businessId
        ? `http://localhost:5001/api/services?businessId=${businessId}`
        : "http://localhost:5001/api/services";

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create service");
      }

      alert("Service added successfully!");

      setFormData({
        businessId: businesses[0]?._id || "",
        name: "",
        description: "",
        duration: "",
        price: "",
        category: "",
      });

      fetchServices();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      const response = await fetch(`http://localhost:5001/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete service.");

      fetchServices();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="mb-8 text-3xl font-bold text-[#14171A]">
        Services
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

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

        <input
          type="number"
          name="duration"
          placeholder="Duration (minutes)"
          value={formData.duration}
          onChange={handleChange}
          className="w-full rounded-xl border p-4"
          required
        />

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

        <button
          type="submit"
          className="w-full rounded-xl bg-[#F2542D] py-4 font-semibold text-white hover:bg-[#D8431F]"
        >
          Add Service
        </button>

      </form>

      <div className="mt-10 space-y-4">

        {services.map((service) => (

          <div
            key={service._id}
            className="flex items-center justify-between rounded-2xl border border-[#ECE9E6] p-5"
          >

            <div>
              <h3 className="text-xl font-bold">
                {service.name}
              </h3>

              <p className="text-gray-500">
                {service.description}
              </p>

              <div className="mt-3 flex gap-6 text-sm">
                <span>⏱ {service.duration} mins</span>
                <span>KES {service.price}</span>
                <span>{service.category}</span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(service._id)}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default ServiceManager;
