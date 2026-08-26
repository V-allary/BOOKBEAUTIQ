import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BusinessCard from "../components/BusinessCard";

function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  const urlCategory = searchParams.get("category");

  const [category, setCategory] = useState(
    urlCategory || "All"
  );

  const [activeSearch, setActiveSearch] = useState({
    searchTerm: "",
    location: "",
    category: urlCategory || "All",
  });

  const businessesRef = useRef(null);

  // ==========================================
  // FETCH APPROVED BUSINESSES
  // ==========================================

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/businesses/approved"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load businesses."
          );
        }

        setBusinesses(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Error fetching businesses:",
          error
        );

        setError(
          "Unable to load businesses right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  // ==========================================
  // SYNC URL CATEGORY
  // ==========================================

  useEffect(() => {
    const selectedCategory =
      urlCategory || "All";

    setCategory(selectedCategory);

    setActiveSearch((current) => ({
      ...current,
      category: selectedCategory,
    }));
  }, [urlCategory]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = () => {
    const selectedCategory = category || "All";

    setActiveSearch({
      searchTerm: searchTerm.trim(),
      location: location.trim(),
      category: selectedCategory,
    });

    if (selectedCategory === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set(
        "category",
        selectedCategory
      );
    }

    setSearchParams(searchParams);
  };

  // ==========================================
  // CATEGORY FILTER
  // ==========================================

  const handleCategoryClick = (
    selectedCategory
  ) => {
    setCategory(selectedCategory);

    setActiveSearch({
      searchTerm: searchTerm.trim(),
      location: location.trim(),
      category: selectedCategory,
    });

    if (selectedCategory === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set(
        "category",
        selectedCategory
      );
    }

    setSearchParams(searchParams);
  };

  // ==========================================
  // FILTER BUSINESSES
  // ==========================================

  const filteredBusinesses =
    businesses.filter((business) => {
      const searchValue =
        activeSearch.searchTerm.toLowerCase();

      const locationValue =
        activeSearch.location.toLowerCase();

      const categoryValue =
        activeSearch.category.toLowerCase();

      const matchesSearch =
        !searchValue ||
        business.name
          ?.toLowerCase()
          .includes(searchValue) ||
        business.category
          ?.toLowerCase()
          .includes(searchValue) ||
        business.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesLocation =
        !locationValue ||
        business.location
          ?.toLowerCase()
          .includes(locationValue);

      const matchesCategory =
        activeSearch.category === "All" ||
        business.category
          ?.toLowerCase()
          .includes(categoryValue);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCategory
      );
    });

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = [
    { name: "All", label: "All" },
    { name: "Hair", label: "Hair" },
    { name: "Nails", label: "Nails" },
    { name: "Barber", label: "Barber" },
    { name: "Makeup", label: "Makeup" },
    { name: "Spa", label: "Spa" },
  ];

  // ==========================================
  // HORIZONTAL BUSINESS SCROLL
  // ==========================================

  const scrollBusinesses = (direction) => {
    if (!businessesRef.current) return;

    const amount =
      businessesRef.current.clientWidth *
      0.85;

    businessesRef.current.scrollBy({
      left:
        direction === "next"
          ? amount
          : -amount,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAFAF9]">

        {/* ==========================================
            EXPLORE HERO
        ========================================== */}

        <section className="relative overflow-hidden border-b border-[#ECE9E6] bg-gradient-to-br from-[#FFF9FB] via-[#F8EEF2] to-[#FAFAF9]">

          <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#E8C5D0]/30 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-[#F2DDE4]/40 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5 pb-28 pt-14 sm:px-6 lg:px-8">

            <div className="max-w-3xl">

              <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
                Explore BookBeautiq
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-1.5px] text-[#242424] sm:text-5xl lg:text-6xl">

                Find your next

                <span className="block text-[#B96882]">
                  beauty experience.
                </span>

              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Discover verified salons, spas, barbers,
                nail artists, makeup artists and beauty
                professionals near you.
              </p>

            </div>

          </div>

        </section>

        {/* ==========================================
            SEARCH PANEL
        ========================================== */}

        <section className="relative z-20 mx-auto -mt-16 max-w-7xl px-5 sm:px-6 lg:px-8">

          <div className="rounded-[28px] border border-[#E5E2DF] bg-white p-3 shadow-[0_18px_55px_rgba(20,23,26,0.08)]">

            <div className="grid gap-2 lg:grid-cols-[1.7fr_1.4fr_1.1fr_auto]">

              {/* SERVICE */}

              <div className="rounded-2xl bg-[#F7F6F5] px-5 py-4 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-[#B96882]">

                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400">
                  Service
                </p>

                <input
                  type="text"
                  placeholder="Hair, nails, spa..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="mt-1.5 w-full bg-transparent text-sm font-medium text-[#242424] outline-none placeholder:text-gray-400"
                />

              </div>

              {/* LOCATION */}

              <div className="rounded-2xl bg-[#F7F6F5] px-5 py-4 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-[#B96882]">

                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400">
                  Location
                </p>

                <input
                  type="text"
                  placeholder="City or area"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="mt-1.5 w-full bg-transparent text-sm font-medium text-[#242424] outline-none placeholder:text-gray-400"
                />

              </div>

              {/* CATEGORY */}

              <div className="rounded-2xl bg-[#F7F6F5] px-5 py-4 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-[#B96882]">

                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400">
                  Category
                </p>

                <select
                  value={category}
                  onChange={(e) => {
                    const selected =
                      e.target.value;

                    setCategory(selected);
                  }}
                  className="mt-1.5 w-full cursor-pointer bg-transparent text-sm font-medium text-[#242424] outline-none"
                >

                  <option value="All">
                    All categories
                  </option>

                  <option value="Hair">
                    Hair
                  </option>

                  <option value="Nails">
                    Nails
                  </option>

                  <option value="Spa">
                    Spa
                  </option>

                  <option value="Barber">
                    Barber
                  </option>

                  <option value="Makeup">
                    Makeup
                  </option>

                </select>

              </div>

              {/* SEARCH BUTTON */}

              <button
                type="button"
                onClick={handleSearch}
                className="min-h-[58px] rounded-2xl bg-[#B96882] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#A65370] hover:shadow-md active:scale-[0.98]"
              >
                Search
              </button>

            </div>

          </div>

        </section>

        {/* ==========================================
            CATEGORY FILTERS
        ========================================== */}

        <section className="pt-10">

          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {categories.map((item) => (

                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    handleCategoryClick(
                      item.name
                    )
                  }
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    category === item.name
                      ? "bg-[#242424] text-white shadow-sm"
                      : "border border-[#E5E2DF] bg-white text-gray-600 hover:border-[#B96882] hover:text-[#B96882]"
                  }`}
                >
                  {item.label}
                </button>

              ))}

            </div>

          </div>

        </section>

        {/* ==========================================
            RESULTS
        ========================================== */}

        <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">

          {/* HEADER */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
                Discover
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
                Beauty professionals
              </h2>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Explore verified businesses available
                on BookBeautiq.
              </p>

            </div>

            {!loading && !error && (

              <div className="self-start rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm ring-1 ring-[#E5E2DF] sm:self-auto">

                {filteredBusinesses.length}{" "}

                {filteredBusinesses.length === 1
                  ? "professional"
                  : "professionals"}

              </div>

            )}

          </div>

          {/* ==========================================
              LOADING
          ========================================== */}

          {loading && (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {[1, 2, 3, 4].map((item) => (

                <div
                  key={item}
                  className="overflow-hidden rounded-[24px] border border-[#E5E2DF] bg-white"
                >

                  <div className="h-64 animate-pulse bg-[#F0EEEC]" />

                  <div className="space-y-3 p-5">

                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#F0EEEC]" />

                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#F0EEEC]" />

                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#F0EEEC]" />

                    <div className="mt-5 h-10 w-full animate-pulse rounded-xl bg-[#F0EEEC]" />

                  </div>

                </div>

              ))}

            </div>

          )}

          {/* ==========================================
              ERROR
          ========================================== */}

          {!loading && error && (

            <div className="rounded-[28px] border border-red-100 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-red-500">
                !
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#242424]">
                Something went wrong
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {error}
              </p>

            </div>

          )}

          {/* ==========================================
              NO BUSINESSES
          ========================================== */}

          {!loading &&
            !error &&
            businesses.length === 0 && (

              <div className="rounded-[28px] border border-[#E5E2DF] bg-white p-14 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E8EC] text-xl text-[#B96882]">
                  ✦
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#242424]">
                  No professionals yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  There are no approved businesses
                  available yet. Check back soon as
                  more professionals join BookBeautiq.
                </p>

              </div>

            )}

          {/* ==========================================
              NO SEARCH RESULTS
          ========================================== */}

          {!loading &&
            !error &&
            businesses.length > 0 &&
            filteredBusinesses.length === 0 && (

              <div className="rounded-[28px] border border-[#E5E2DF] bg-white p-14 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E8EC] text-xl text-[#B96882]">
                  ⌕
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#242424]">
                  No matches found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  We couldn't find a professional
                  matching your search. Try another
                  location, service or category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setLocation("");
                    setCategory("All");

                    setActiveSearch({
                      searchTerm: "",
                      location: "",
                      category: "All",
                    });

                    searchParams.delete(
                      "category"
                    );

                    setSearchParams(
                      searchParams
                    );
                  }}
                  className="mt-6 rounded-full bg-[#242424] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#B96882]"
                >
                  Clear filters
                </button>

              </div>

            )}

          {/* ==========================================
              BUSINESS SLIDER
          ========================================== */}

          {!loading &&
            !error &&
            filteredBusinesses.length > 0 && (

              <div className="relative">

                {/* Desktop arrows */}

                {filteredBusinesses.length > 4 && (

                  <div className="mb-4 hidden justify-end gap-2 sm:flex">

                    <button
                      type="button"
                      onClick={() =>
                        scrollBusinesses(
                          "prev"
                        )
                      }
                      aria-label="Previous businesses"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DED9DE] bg-white text-lg text-[#333] transition hover:border-[#B96882] hover:text-[#B96882]"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scrollBusinesses(
                          "next"
                        )
                      }
                      aria-label="Next businesses"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DED9DE] bg-white text-lg text-[#333] transition hover:border-[#B96882] hover:text-[#B96882]"
                    >
                      →
                    </button>

                  </div>

                )}

                {/* Slider */}

                <div
                  ref={businessesRef}
                  className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >

                  {filteredBusinesses.map(
                    (business) => (

                      <div
                        key={business._id}
                        className="min-w-[82%] sm:min-w-[48%] lg:min-w-[calc(25%-18px)]"
                      >

                        <BusinessCard
                          business={{
                            ...business,
                            id: business._id,
                          }}
                        />

                      </div>

                    )
                  )}

                </div>

                {/* Mobile swipe indicator */}

                {filteredBusinesses.length > 1 && (

                  <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400 sm:hidden">
                    <span>
                      Swipe to explore
                    </span>

                    <span className="text-[#B96882]">
                      →
                    </span>
                  </div>

                )}

              </div>

            )}

        </section>

      </main>

      <Footer />
    </>
  );
}

export default Explore;