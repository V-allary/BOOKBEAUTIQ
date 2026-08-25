function StaffSelector({ staff = [], selectedStaff, setSelectedStaff, loading }) {
  if (loading) return <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">Loading staff...</div>;
  if (staff.length === 0) return <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm text-gray-500">No staff available yet.</div>;

  return (
    <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">Choose Your Professional</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {staff.map((member) => (
          <button
            key={member._id}
            onClick={() => setSelectedStaff(member)}
            className={`rounded-2xl border p-6 text-center transition ${
              selectedStaff?._id === member._id
                ? "border-[#D97CA5] bg-[#FFF5F9]"
                : "border-pink-100 hover:border-[#D97CA5] hover:bg-[#FFF5F9]"
            }`}
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-3xl">👤</div>
            <h3 className="font-semibold text-[#1F2937]">{member.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{member.role}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
export default StaffSelector;
