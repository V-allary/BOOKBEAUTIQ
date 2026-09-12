import { API_URL } from "../../config";

function StaffSelector({ staff = [], selectedStaff, setSelectedStaff, loading }) {
  if (loading) return <p className="text-sm text-gray-400">Loading staff...</p>;
  if (staff.length === 0) return null;

  const imageUrl = (img) =>
    img?.startsWith("/uploads/") ? `${API_URL}${img}` : img;

  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-[#242424]">Professional</label>
      <div className="grid gap-4 sm:grid-cols-3">
        {staff.map((member) => (
          <button
            key={member._id}
            type="button"
            onClick={() => setSelectedStaff(member)}
            className={`rounded-xl border p-4 text-center transition ${
              selectedStaff?._id === member._id
                ? "border-[#B96882] bg-[#FFF5F9]"
                : "border-[#E5E2DF] hover:border-[#B96882] hover:bg-[#FFF5F9]"
            }`}
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#F2E8EC] text-2xl">
              {member.image ? (
                <img
                  src={imageUrl(member.image)}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                "👤"
              )}
            </div>
            <h3 className="text-sm font-semibold text-[#242424]">{member.name}</h3>
            <p className="mt-1 text-xs text-gray-500">{member.role}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default StaffSelector;
