import { useEffect, useState } from "react";

function BusinessList() {
  const [businesses, setBusinesses] = useState([]);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/businesses"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch businesses."
        );
      }

      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const deleteBusiness = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this business?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/businesses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete business."
        );
      }

      alert("Business deleted successfully!");

      fetchBusinesses();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const endpoint =
        status === "approved"
          ? "approve"
          : "reject";

      const response = await fetch(
        `http://localhost:5001/api/businesses/${id}/${endpoint}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${status} business.`
        );
      }

      alert(data.message);

      fetchBusinesses();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    }
  };

  return (
    <div className="mt-12 rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="mb-8 text-3xl font-bold text-[#1F2937]">
        Businesses
      </h2>

      {businesses.length === 0 ? (
        <p className="text-gray-500">
          No businesses available.
        </p>
      ) : (
        <div className="space-y-5">

          {businesses.map((business) => (

            <div
              key={business._id}
              className="rounded-2xl border border-pink-100 p-5"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h3 className="text-xl font-semibold text-[#1F2937]">
                    {business.name}
                  </h3>

                  <p className="text-gray-500">
                    {business.location}
                  </p>

                  <p className="mt-1 text-sm text-pink-500">
                    {business.category}
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      business.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : business.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {business.status || "pending"}
                  </span>

                </div>

                <div className="flex flex-wrap gap-3">

                  {/* Approve / Reject */}

                  {business.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus(
                            business._id,
                            "approved"
                          )
                        }
                        className="rounded-xl bg-green-500 px-5 py-2 font-semibold text-white transition hover:bg-green-600"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            business._id,
                            "rejected"
                          )
                        }
                        className="rounded-xl bg-orange-500 px-5 py-2 font-semibold text-white transition hover:bg-orange-600"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    className="rounded-xl bg-blue-500 px-5 py-2 font-semibold text-white transition hover:bg-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteBusiness(business._id)
                    }
                    className="rounded-xl bg-red-500 px-5 py-2 font-semibold text-white transition hover:bg-red-600"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default BusinessList;