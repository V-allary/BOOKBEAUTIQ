import { API_URL } from "../../config";

function StaffSelector({ staff = [], selectedStaff, setSelectedStaff, loading }) {
  if (loading) return <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm text-gray-500">Loading staff...</div>;
  if (staff.length === 0) return null;

  const imageUrl = (img) =>
    img?.startsWith("/uploads/") ? `${API_URL}${img}` : img;

  return (
    <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-[#242424]">Choose Your Professional</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {staff.map((member) => (
          <button
            key={member._id}
            type="button"
            onClick={() => setSelectedStaff(member)}
            className={`rounded-2xl border p-6 text-center transition ${
              selectedStaff?._id === member._id
                ? "border-[#B96882] bg-[#FFF5F9]"
                : "border-[#E5E2DF] hover:border-[#B96882] hover:bg-[#FFF5F9]"
            }`}
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#F2E8EC] text-3xl">
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
            <h3 className="font-semibold text-[#242424]">{member.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{member.role}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default StaffSelector;
