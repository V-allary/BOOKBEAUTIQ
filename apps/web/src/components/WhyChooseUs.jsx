function WhyChooseUs() {
  const features = [
    {
      number: "01",
      title: "Verified Professionals",
      text: "Book trusted salons and beauty experts with confidence.",
    },
    {
      number: "02",
      title: "Instant Booking",
      text: "Find your service and secure your appointment in seconds.",
    },
    {
      number: "03",
      title: "Secure Payments",
      text: "Enjoy a simple and secure checkout experience every time.",
    },
    {
      number: "04",
      title: "Real Reviews",
      text: "Make better choices with genuine ratings from real customers.",
    },
  ];

  return (
    <section className="bg-[#171717] py-16 text-white sm:py-20 lg:py-24">

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =========================
            HEADER
        ========================== */}

        <div className="max-w-2xl">

          <p className="text-xs font-bold uppercase tracking-[3px] text-[#D97CA5]">
            The BookBeautiq difference
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Beauty booking,
            <br />
            made beautifully simple.
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
            Everything you need to discover trusted professionals,
            book with confidence and manage your beauty appointments
            effortlessly.
          </p>

        </div>

        {/* =========================
            FEATURES
        ========================== */}

        <div className="mt-12 grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((item, index) => (

            <div
              key={item.title}
              className={`group border-white/10 py-8 lg:px-7 lg:py-10 ${
                index !== 0 ? "sm:border-l" : ""
              } ${
                index >= 2 ? "sm:border-t lg:border-t-0" : ""
              } ${
                index !== 0 ? "lg:border-l" : ""
              }`}
            >

              {/* Number */}

              <div className="flex items-center justify-between">

                <span className="text-sm font-semibold text-white/30">
                  {item.number}
                </span>

                <span className="h-px w-10 bg-white/10 transition-all duration-300 group-hover:w-16 group-hover:bg-[#D97CA5]" />

              </div>

              {/* Title */}

              <h3 className="mt-12 text-xl font-semibold tracking-tight">
                {item.title}
              </h3>

              {/* Description */}

              <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">
                {item.text}
              </p>

              {/* Accent */}

              <div className="mt-7 h-1 w-8 rounded-full bg-[#D97CA5] transition-all duration-300 group-hover:w-14" />

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default WhyChooseUs;