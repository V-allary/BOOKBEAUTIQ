function Categories() {
  const categories = [
    {
      name: "Hair",
      image:
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=900",
    },
    {
      name: "Nails",
      image:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900",
    },
    {
      name: "Barber",
      image:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900",
    },
    {
      name: "Spa",
      image:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900",
    },
    {
      name: "Makeup",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900",
    },
    {
      name: "Lashes",
      image:
        "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=900",
    },
    {
      name: "Skincare",
      image:
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900",
    },
    {
      name: "Bridal",
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=900",
    },
  ];

  return (
    <section className="bg-[#FAFAFA] py-16 sm:py-20 lg:py-24">

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =========================
            SECTION HEADER
        ========================== */}

        <div className="mb-8 flex items-end justify-between sm:mb-10">

          <div>
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#D97CA5]">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
              Find your beauty service
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#777] sm:text-base">
              Explore services from trusted beauty professionals
              across Africa.
            </p>
          </div>

          <button
            type="button"
            className="hidden rounded-full border border-[#DED9DE] bg-white px-5 py-2.5 text-sm font-semibold text-[#333] transition hover:border-[#D97CA5] hover:text-[#D97CA5] sm:block"
          >
            View all
          </button>

        </div>

        {/* =========================
            CATEGORY CARDS
        ========================== */}

        <div className="flex gap-4 overflow-x-auto pb-5 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible lg:grid-cols-4">

          {categories.map((category) => (

            <button
              key={category.name}
              type="button"
              className="group relative min-w-[190px] overflow-hidden rounded-[24px] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-w-0"
            >

              {/* Image */}

              <div className="relative h-[240px] overflow-hidden sm:h-[260px]">

                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* Elegant overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                {/* Category name */}

                <div className="absolute bottom-0 left-0 right-0 p-5">

                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-white/75">
                    Explore services
                  </p>

                </div>

                {/* Arrow */}

                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#222] opacity-0 shadow-sm transition duration-300 group-hover:opacity-100">
                  →
                </div>

              </div>

            </button>

          ))}

        </div>

        {/* Mobile View All */}

        <div className="mt-6 flex justify-center sm:hidden">

          <button
            type="button"
            className="rounded-full border border-[#DED9DE] bg-white px-7 py-3 text-sm font-semibold text-[#333] shadow-sm transition hover:border-[#D97CA5] hover:text-[#D97CA5]"
          >
            View all categories
          </button>

        </div>

      </div>

    </section>
  );
}

export default Categories;