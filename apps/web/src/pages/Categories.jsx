import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAFAF9]">

        {/* HERO */}

        <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF9FB] via-[#F8EEF2] to-[#FAFAF9]">

          <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#E8C5D0]/30 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[#F2DDE4]/40 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">

            <div className="max-w-3xl">

              <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
                Explore BookBeautiq
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-1.5px] text-[#242424] sm:text-5xl lg:text-6xl">
                Find the beauty service
                <span className="block text-[#B96882]">
                  that's right for you.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Browse beauty and wellness categories and discover
                verified professionals across Africa.
              </p>

            </div>

          </div>

        </section>

        {/* CATEGORY GRID */}

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">

          <div className="mb-10">

            <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
              Categories
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
              What are you looking for?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Choose a category to discover businesses and
              professionals offering the services you need.
            </p>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {categories.map((category) => (

              <Link
                key={category.name}
                to={`/explore?category=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-[24px] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(40,30,40,0.12)]"
              >

                <div className="relative h-[280px] overflow-hidden">

                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">

                    <h3 className="text-xl font-bold tracking-tight text-white">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-white/75">
                      Explore {category.name.toLowerCase()} services
                    </p>

                  </div>

                  <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#B96882] opacity-0 shadow-sm transition duration-300 group-hover:opacity-100">
                    →
                  </div>

                </div>

              </Link>

            ))}

          </div>

        </section>

        {/* EXPLORE CTA */}

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">

          <div className="rounded-[28px] bg-[#F2E8EC] px-6 py-10 text-center sm:px-10 sm:py-14">

            <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
              Can't decide?
            </p>

            <h2 className="mt-3 text-2xl font-bold text-[#242424] sm:text-3xl">
              Explore all beauty professionals
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
              Browse verified businesses across different categories,
              locations and price ranges.
            </p>

            <Link
              to="/explore"
              className="mt-6 inline-flex rounded-full bg-[#B96882] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#A65370]"
            >
              Explore All
            </Link>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default Categories;