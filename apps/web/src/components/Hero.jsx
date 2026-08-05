function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFFDFE] via-[#FFF8FB] to-[#FDF1F6]">

      {/* Background Glow */}
      <div className="absolute -top-44 -left-44 h-[420px] w-[420px] rounded-full bg-[#F9D8E7]/40 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-[#FFE8F1]/50 blur-3xl"></div>

      <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-16">

        <div className="text-center">

          {/* App Button */}

          <div className="mb-8 flex justify-center">
            <button className="rounded-full border border-[#F7D7E5] bg-white px-6 py-3 text-sm font-semibold text-[#D97CA5] shadow-md transition hover:shadow-lg">
              📱 Download the BookBeautiq App
            </button>
          </div>

          {/* Badge */}

          <div className="inline-flex items-center rounded-full bg-[#FFF4F8] px-5 py-2">
            <span className="text-sm font-medium text-[#D97CA5]">
              Trusted by beauty professionals across Africa
            </span>
          </div>

          {/* Heading */}

          <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-2px] text-[#1F2937] md:text-6xl">
            Discover & Book
            <br />
            <span className="text-[#D97CA5]">
              Beauty Professionals
            </span>
            <br />
            Near You
          </h1>

          {/* Description */}

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Find trusted salons, barbers, nail artists, spas,
            makeup artists and wellness professionals near you.
          </p>

          {/* Search Card */}

          <div className="mx-auto mt-10 max-w-6xl rounded-full border border-[#F7D7E5] bg-white p-2 shadow-2xl">

            <div className="grid items-center lg:grid-cols-[2fr_2fr_1.3fr_auto]">

              <div className="border-r border-gray-200 px-6 py-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Service
                </p>

                <input
                  type="text"
                  placeholder="Hair, Nails, Spa..."
                  className="mt-1 w-full bg-transparent outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="border-r border-gray-200 px-6 py-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Location
                </p>

                <input
                  type="text"
                  placeholder="Current location"
                  className="mt-1 w-full bg-transparent outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="border-r border-gray-200 px-6 py-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Date
                </p>

                <input
                  type="date"
                  className="mt-1 w-full bg-transparent outline-none"
                />
              </div>

              <div className="p-2">
                <button className="w-full rounded-full bg-[#D97CA5] px-10 py-4 font-semibold text-white transition hover:bg-[#CC6C98]">
                  Search
                </button>
              </div>

            </div>

          </div>

          {/* Stats */}

          <div className="mt-10 flex flex-wrap justify-center gap-14">

            <div>
              <h3 className="text-3xl font-bold text-[#1F2937]">20K+</h3>
              <p className="mt-1 text-gray-500">Professionals</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#1F2937]">1M+</h3>
              <p className="mt-1 text-gray-500">Bookings</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#1F2937]">15+</h3>
              <p className="mt-1 text-gray-500">Countries</p>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;