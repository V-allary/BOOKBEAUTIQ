import { useNavigate } from "react-router-dom";

function PopularCities() {
  const navigate = useNavigate();

  const cities = [
    {
      name: "Nairobi",
      country: "Kenya",
      image: "https://source.unsplash.com/800x800/?nairobi,kenya,city",
    },
    {
      name: "Mombasa",
      country: "Kenya",
      image: "https://source.unsplash.com/800x800/?mombasa,kenya,coast",
    },
    {
      name: "Kisumu",
      country: "Kenya",
      image: "https://source.unsplash.com/800x800/?kisumu,kenya,lakevictoria",
    },
    {
      name: "Nakuru",
      country: "Kenya",
      image: "https://source.unsplash.com/800x800/?nakuru,kenya",
    },
    {
      name: "Eldoret",
      country: "Kenya",
      image: "https://source.unsplash.com/800x800/?eldoret,kenya",
    },
    {
      name: "Kampala",
      country: "Uganda",
      image: "https://source.unsplash.com/800x800/?kampala,uganda,city",
    },
    {
      name: "Kigali",
      country: "Rwanda",
      image: "https://source.unsplash.com/800x800/?kigali,rwanda,city",
    },
    {
      name: "Dar es Salaam",
      country: "Tanzania",
      image: "https://source.unsplash.com/800x800/?daressalaam,tanzania,city",
    },
  ];

  const handleCityClick = (cityName) => {
    navigate(`/explore?location=${encodeURIComponent(cityName)}`);
  };

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =========================
            HEADER
        ========================== */}

        <div className="mb-10 flex items-end justify-between sm:mb-12">

          <div>

            <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
              Explore Africa
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
              Find beauty near you
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#777] sm:text-base">
              Discover trusted beauty professionals in some of
              our most popular cities.
            </p>

          </div>

          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="hidden rounded-full border border-[#DED9DE] px-5 py-2.5 text-sm font-semibold text-[#333] transition hover:border-[#B96882] hover:text-[#B96882] sm:block"
          >
            Explore all cities
          </button>

        </div>

        {/* =========================
            CITY CARDS
        ========================== */}

        <div className="flex gap-4 overflow-x-auto pb-5 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible lg:grid-cols-4">

          {cities.map((city) => (

            <button
              key={city.name}
              type="button"
              onClick={() => handleCityClick(city.name)}
              className="group relative min-w-[210px] overflow-hidden rounded-[24px] text-left sm:min-w-0"
            >

              {/* Image */}

              <div className="relative h-[220px] overflow-hidden sm:h-[230px]">

                <img
                  src={city.image}
                  alt={city.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* Overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* City information */}

                <div className="absolute bottom-0 left-0 right-0 p-5">

                  <p className="text-xs font-medium uppercase tracking-[2px] text-white/65">
                    {city.country}
                  </p>

                  <h3 className="mt-1 text-xl font-semibold text-white">
                    {city.name}
                  </h3>

                </div>

                {/* Arrow */}

                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#222] opacity-0 shadow-sm transition duration-300 group-hover:opacity-100">
                  →
                </div>

              </div>

            </button>

          ))}

        </div>

        {/* Mobile button */}

        <div className="mt-6 flex justify-center sm:hidden">

          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="rounded-full border border-[#DED9DE] px-7 py-3 text-sm font-semibold text-[#333] transition hover:border-[#B96882] hover:text-[#B96882]"
          >
            Explore all cities
          </button>

        </div>

      </div>

    </section>
  );
}

export default PopularCities;
