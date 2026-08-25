function DownloadApp() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        <div className="relative overflow-hidden rounded-[32px] bg-[#171717] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">

          {/* Background glow */}

          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D97CA5]/20 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-[#D97CA5]/10 blur-3xl" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">

            {/* =========================
                CONTENT
            ========================== */}

            <div className="max-w-2xl">

              <p className="text-xs font-bold uppercase tracking-[3px] text-[#D97CA5]">
                BookBeautiq app
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Your beauty appointments,
                <br className="hidden sm:block" />
                wherever you go.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                Discover trusted professionals, book appointments,
                chat with businesses and manage your beauty journey
                directly from your phone.
              </p>

              {/* App buttons */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  className="flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#171717] transition hover:bg-[#F5F5F5]"
                >
                  <span className="text-lg"></span>
                  Download for iPhone
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <span className="text-lg">▶️</span>
                  Download for Android
                </button>

              </div>

              <p className="mt-5 text-xs text-white/35">
                Available soon on the App Store and Google Play.
              </p>

            </div>

            {/* =========================
                PHONE VISUAL
            ========================== */}

            <div className="relative mx-auto hidden h-[330px] w-[230px] lg:block">

              {/* Phone */}

              <div className="absolute left-1/2 top-1/2 h-[310px] w-[170px] -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] rounded-[30px] border-[6px] border-[#2B2B2B] bg-white shadow-2xl">

                {/* Camera */}

                <div className="absolute left-1/2 top-2 h-4 w-12 -translate-x-1/2 rounded-full bg-[#171717]" />

                {/* Screen */}

                <div className="flex h-full flex-col overflow-hidden rounded-[23px] bg-[#FAF7F8] pt-10">

                  <div className="px-4">

                    <p className="text-[8px] font-semibold text-[#999]">
                      Discover
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#171717]">
                      Beauty near you
                    </p>

                  </div>

                  <div className="mx-4 mt-4 h-24 overflow-hidden rounded-xl bg-[#E8D1D9]">
                    <div className="h-full w-full bg-gradient-to-br from-[#E9C8D4] to-[#C98DA7]" />
                  </div>

                  <div className="px-4 pt-4">

                    <div className="h-2 w-20 rounded-full bg-[#222]" />

                    <div className="mt-2 h-1.5 w-28 rounded-full bg-[#DDD]" />

                    <div className="mt-4 flex gap-2">

                      <div className="h-8 flex-1 rounded-lg bg-[#F1E3E8]" />
                      <div className="h-8 flex-1 rounded-lg bg-[#F1E3E8]" />

                    </div>

                  </div>

                  <div className="mt-auto flex justify-around border-t border-[#EEE] bg-white py-3">
                    <span className="text-[9px]">Home</span>
                    <span className="text-[9px] text-[#D97CA5]">Explore</span>
                    <span className="text-[9px]">Bookings</span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default DownloadApp;