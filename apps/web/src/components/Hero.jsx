import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    if (date) {
      params.set("date", date);
    }

    navigate(
      `/explore${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#F9F5F2]">

      {/* ==========================================
          BOOKBEAUTIQ HERO BACKGROUND
      ========================================== */}

    
      <div className="pointer-events-none absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-[#F2D6E1]/70 blur-3xl" />

      
      <div className="pointer-events-none absolute right-[-180px] top-[-120px] h-[520px] w-[520px] rounded-full bg-[#F8E9E2]/80 blur-3xl" />

   
      <div className="pointer-events-none absolute bottom-[-220px] left-[35%] h-[500px] w-[650px] rounded-full bg-[#EFC8D7]/35 blur-3xl" />

    
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.85),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24">

        {/* ==========================================
            HERO CONTENT
        ========================================== */}

        <div className="mx-auto max-w-4xl">

          {/* Badge */}

          <div className="mb-6 flex justify-center lg:mb-8">

            <div className="inline-flex items-center rounded-full border border-[#E4D4DA] bg-white/75 px-4 py-2 text-xs font-semibold text-[#9D536D] shadow-sm backdrop-blur-md sm:px-5 sm:text-sm">
              ✦ Africa's beauty & wellness marketplace
            </div>

          </div>

          {/* Heading */}

          <h1 className="text-center text-[46px] font-bold leading-[0.98] tracking-[-2.5px] text-[#242424] sm:text-6xl lg:text-7xl">

            Discover & book

            <br />

            <span className="text-[#B96882]">
              beauty & wellness
            </span>

            <br />

            near you

          </h1>

          {/* Description */}

          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-7 text-[#625D5B] sm:mt-7 sm:text-lg sm:leading-8">

            Discover trusted salons, barbers, nail artists,
            spas and beauty professionals across Africa.

          </p>

        </div>

        {/* ==========================================
            SEARCH CARD
            KEEPING YOUR DARK SEARCH BUTTON
        ========================================== */}

        <div className="mx-auto mt-9 max-w-5xl rounded-[28px] border border-white/90 bg-white/95 p-3 shadow-[0_20px_60px_rgba(80,55,65,0.12)] backdrop-blur-xl sm:mt-10 sm:rounded-[32px] sm:p-4">

          <div className="grid gap-2 lg:grid-cols-[1.5fr_1.4fr_1.1fr_auto] lg:items-center lg:gap-0">

            {/* SERVICE */}

            <div className="rounded-2xl border border-[#E5E2DF] bg-white px-5 py-4 text-left transition focus-within:border-[#B96882] lg:rounded-none lg:border-0 lg:border-r lg:px-6">

              <p className="text-[11px] font-bold uppercase tracking-wider text-[#999391]">
                What
              </p>

              <input
                type="text"
                placeholder="Hair, nails, spa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mt-1 w-full bg-transparent text-sm font-medium text-[#242424] outline-none placeholder:text-[#999]"
              />

            </div>

            {/* LOCATION */}

            <div className="rounded-2xl border border-[#E5E2DF] bg-white px-5 py-4 text-left transition focus-within:border-[#B96882] lg:rounded-none lg:border-0 lg:border-r lg:px-6">

              <p className="text-[11px] font-bold uppercase tracking-wider text-[#999391]">
                Where
              </p>

              <input
                type="text"
                placeholder="Current location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mt-1 w-full bg-transparent text-sm font-medium text-[#242424] outline-none placeholder:text-[#999]"
              />

            </div>

            {/* DATE */}

            <div className="rounded-2xl border border-[#E5E2DF] bg-white px-5 py-4 text-left transition focus-within:border-[#D97CA5] lg:rounded-none lg:border-0 lg:border-r lg:px-6">

              <p className="text-[11px] font-bold uppercase tracking-wider text-[#999391]">
                When
              </p>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full bg-transparent text-sm font-medium text-[#242424] outline-none"
              />

            </div>

            {/* SEARCH BUTTON */}

            <div className="pt-1 lg:p-2">

              <button
                type="button"
                onClick={handleSearch}
                className="w-full rounded-full bg-[#242424] px-8 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-[#B96882] lg:min-w-[130px]"
              >
                Search
              </button>

            </div>

          </div>

        </div>

        {/* ==========================================
            TRUST / STATS
        ========================================== */}

        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-6 text-center sm:mt-10 sm:gap-12">

          <div>
            <p className="text-xl font-bold tracking-tight text-[#242424] sm:text-2xl">
              20K+
            </p>

            <p className="mt-1 text-xs text-[#77716F] sm:text-sm">
              Professionals
            </p>
          </div>

          <div className="h-8 w-px bg-[#DDD3D1]" />

          <div>
            <p className="text-xl font-bold tracking-tight text-[#242424] sm:text-2xl">
              1M+
            </p>

            <p className="mt-1 text-xs text-[#77716F] sm:text-sm">
              Bookings
            </p>
          </div>

          <div className="h-8 w-px bg-[#DDD3D1]" />

          <div>
            <p className="text-xl font-bold tracking-tight text-[#242424] sm:text-2xl">
              15+
            </p>

            <p className="mt-1 text-xs text-[#77716F] sm:text-sm">
              Countries
            </p>
          </div>

        </div>

        {/* ==========================================
            APP CTA
        ========================================== */}

        <div className="mt-9 flex justify-center sm:mt-10">

          <button
            type="button"
            className="rounded-full border border-[#DCD2D0] bg-white/80 px-6 py-3 text-sm font-semibold text-[#242424] shadow-sm transition hover:border-[#B96882] hover:text-[#B96882]"
          >
            Get the BookBeautiq app
          </button>

        </div>

      </div>

    </section>
  );
}

export default Hero;