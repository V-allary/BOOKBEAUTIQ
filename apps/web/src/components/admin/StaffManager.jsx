import { useEffect, useState } from "react";
import { API_URL } from "../../config";

function StaffManager({ businesses }) {
  const [staff, setStaff] = useState([]);
  const token = localStorage.getItem("token");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingStaffId, setEditingStaffId] = useState(null);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const emptyForm = {
    businessId: businesses[0]?._id || "",
    name: "",
    role: "",
    phone: "",
    email: "",
    image: "",
    openingTime: "",
    closingTime: "",
    closedDays: [],
  };

  const [formData, setFormData] = useState(emptyForm);
  const [customHoursEnabled, setCustomHoursEnabled] = useState(false);

  const fetchStaff = async () => {
    try {
      const businessId = formData.businessId || businesses[0]?._id;
      const url = businessId
        ? `${API_URL}/api/staff?businessId=${businessId}`
        : `${API_URL}/api/staff`;

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

  const toggleClosedDay = (day) => {
    setFormData((current) => {
      const isClosed = current.closedDays.includes(day);
      return {
        ...current,
        closedDays: isClosed
          ? current.closedDays.filter((d) => d !== day)
          : [...current.closedDays, day],
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const imageUrl = (img) =>
    img?.startsWith("/uploads/") ? `${API_URL}${img}` : img;

  // ==========================================
  // START EDITING AN EXISTING STAFF MEMBER
  // ==========================================

  const handleEditClick = (member) => {
    setEditingStaffId(member._id);

    setFormData({
      businessId: member.businessId || formData.businessId,
      name: member.name || "",
      role: member.role || "",
      phone: member.phone || "",
      email: member.email || "",
      image: member.image || "",
      openingTime: member.openingTime || "",
      closingTime: member.closingTime || "",
      closedDays: member.closedDays || [],
    });

    setCustomHoursEnabled(!!(member.openingTime || member.closingTime || member.closedDays?.length));

    setImageFile(null);
    setImagePreview(member.image ? imageUrl(member.image) : "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setFormData({ ...emptyForm, businessId: businesses[0]?._id || "" });
    setCustomHoursEnabled(false);
    setImageFile(null);
    setImagePreview("");
  };

  // ==========================================
  // ADD OR UPDATE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedImageUrl = formData.image;

      if (imageFile) {
        const imageData = new FormData();
        imageData.append("image", imageFile);

        const uploadResponse = await fetch(`${API_URL}/api/uploads`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imageData,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadResult.message || "Image upload failed.");
        uploadedImageUrl = uploadResult.imageUrl;
      }

      const isEditing = !!editingStaffId;

      const payload = {
        ...formData,
        image: uploadedImageUrl,
        // If custom hours are turned off, clear them so this person
        // simply follows the business's general hours.
        openingTime: customHoursEnabled ? formData.openingTime : "",
        closingTime: customHoursEnabled ? formData.closingTime : "",
        closedDays: customHoursEnabled ? formData.closedDays : [],
      };

      const response = await fetch(
        isEditing
          ? `${API_URL}/api/staff/${editingStaffId}`
          : `${API_URL}/api/staff`,
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
          data.message || (isEditing ? "Failed to update staff member." : "Failed to add staff.")
        );
      }

      alert(isEditing ? "Staff member updated successfully!" : "Staff member added successfully!");

      handleCancelEdit();
      fetchStaff();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this staff member?")) return;

    try {
      const response = await fetch(`${API_URL}/api/staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to remove staff member.");

      if (editingStaffId === id) {
        handleCancelEdit();
      }

      fetchStaff();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="mb-8 text-3xl font-bold text-[#14171A]">
        Staff Manager
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {editingStaffId && (
          <div className="flex items-center justify-between rounded-xl bg-[#F2E8EC] px-4 py-3">
            <p className="text-sm font-semibold text-[#9D536D]">
              Editing {formData.name || "staff member"}
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

          {imagePreview && (
            <div className="mb-3 h-20 w-20 overflow-hidden rounded-full bg-[#F2E8EC]">
              <img
                src={imagePreview}
                alt="Staff preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-xl border border-dashed border-[#D9A9B8] p-4"
          />

          {editingStaffId && (
            <p className="mt-1 text-xs text-gray-400">
              Leave empty to keep their current photo.
            </p>
          )}
        </div>

        {/* WORKING HOURS */}

        <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-5">

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={customHoursEnabled}
              onChange={(e) => setCustomHoursEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#B96882] focus:ring-[#B96882]"
            />
            <span className="font-semibold text-[#242424]">
              This person works different hours than the business
            </span>
          </label>

          <p className="mt-1 pl-7 text-xs text-gray-500">
            Leave unchecked to follow the business's general hours.
          </p>

          {customHoursEnabled && (
            <div className="mt-4 space-y-4">

              <div className="grid gap-3 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-500">
                    Starts at
                  </label>
                  <input
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, openingTime: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DDDAD7] bg-white p-3.5 text-sm outline-none focus:border-[#B96882]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-500">
                    Ends at
                  </label>
                  <input
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, closingTime: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DDDAD7] bg-white p-3.5 text-sm outline-none focus:border-[#B96882]"
                  />
                </div>

              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-500">
                  Days off
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleClosedDay(day)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        formData.closedDays.includes(day)
                          ? "bg-[#242424] text-white"
                          : "border border-[#DDDAD7] bg-white text-[#242424] hover:border-[#B96882]"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#242424] py-4 font-semibold text-white transition hover:bg-[#B96882]"
        >
          {editingStaffId ? "Save Changes" : "Add Staff"}
        </button>

      </form>

      <div className="mt-10 space-y-4">

        {staff.map((member) => (

          <div
            key={member._id}
            className="flex items-center justify-between rounded-2xl border border-[#ECE9E6] p-5"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-[#F2E8EC]">
                {member.image ? (
                  <img src={imageUrl(member.image)} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl">👤</div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
                {(member.openingTime || member.closingTime) && (
                  <p className="mt-0.5 text-xs text-[#9D536D]">
                    Custom hours: {member.openingTime || "—"} – {member.closingTime || "—"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => handleEditClick(member)}
                className="rounded-xl border border-[#E5E2DF] px-4 py-2 text-sm font-semibold text-[#242424] hover:border-[#B96882] hover:text-[#B96882]"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(member._id)}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Remove
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default StaffManager;