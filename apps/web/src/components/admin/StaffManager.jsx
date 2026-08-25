import { useEffect, useState } from "react";

function StaffManager({ businesses }) {
  const [staff, setStaff] = useState([]);
  const token = localStorage.getItem("token");

  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    businessId: businesses[0]?._id || "",
    name: "",
    role: "",
    phone: "",
    email: "",
    image: "",
  });

  const fetchStaff = async () => {
    try {
      const businessId = formData.businessId || businesses[0]?._id;
      const url = businessId
        ? `http://localhost:5001/api/staff?businessId=${businessId}`
        : "http://localhost:5001/api/staff";

      const response = await fetch(url);
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [formData.businessId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const imageData = new FormData();
        imageData.append("image", imageFile);

        const uploadResponse = await fetch("http://localhost:5001/api/uploads", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imageData,
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadResult.message || "Image upload failed.");
        imageUrl = uploadResult.imageUrl;
      }

      const response = await fetch("http://localhost:5001/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, image: imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add staff");
      }

      alert("Staff member added successfully!");

      setFormData({
        businessId: businesses[0]?._id || "",
        name: "",
        role: "",
        phone: "",
        email: "",
        image: "",
      });
      setImageFile(null);

      fetchStaff();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this staff member?")) return;

    try {
      const response = await fetch(`http://localhost:5001/api/staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to remove staff member.");

      fetchStaff();
    } catch (error) {
      alert(error.message);
    }
  };

  const imageUrl = (img) =>
    img?.startsWith("/uploads/") ? `http://localhost:5001${img}` : img;

  return (
    <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="mb-8 text-3xl font-bold text-[#14171A]">
        Staff Manager
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {businesses.length > 1 && (
          <select
            name="businessId"
            value={formData.businessId}
            onChange={handleChange}
            className="w-full rounded-xl border p-4"
            required
          >
            <option value="">Select Business</option>
            {businesses.map((business) => (
              <option key={business._id} value={business._id}>
                {business.name}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          name="name"
          placeholder="Staff Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-xl border p-4"
          required
        />

        <input
          type="text"
          name="role"
          placeholder="Role"
          value={formData.role}
          onChange={handleChange}
          className="w-full rounded-xl border p-4"
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-xl border p-4"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border p-4"
        />

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Staff Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-xl border border-dashed border-orange-300 p-4"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#F2542D] py-4 font-semibold text-white hover:bg-[#D8431F]"
        >
          Add Staff
        </button>

      </form>

      <div className="mt-10 space-y-4">

        {staff.map((member) => (

          <div
            key={member._id}
            className="flex items-center justify-between rounded-2xl border border-[#ECE9E6] p-5"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-orange-100">
                {member.image ? (
                  <img src={imageUrl(member.image)} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl">👤</div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(member._id)}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Remove
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default StaffManager;
