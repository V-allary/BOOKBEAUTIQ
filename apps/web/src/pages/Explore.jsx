import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BusinessCard from "../components/BusinessCard";

function Explore() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FFF8FB]">

        {/* Search Section */}

<section className="mx-auto -mt-10 max-w-7xl px-6 relative z-10">

<div className="rounded-3xl bg-white p-4 shadow-xl border border-pink-100">

  <div className="grid gap-4 lg:grid-cols-[2fr_1.5fr_1.2fr_auto]">

    {/* Service */}

    <div className="rounded-2xl border border-pink-100 px-5 py-4">

      <p className="text-xs font-semibold uppercase text-gray-400">
        Service
      </p>

      <input
        type="text"
        placeholder="Hair, Nails, Spa..."
        className="mt-2 w-full bg-transparent outline-none text-[#1F2937]"
      />

    </div>

    {/* Location */}

    <div className="rounded-2xl border border-pink-100 px-5 py-4">

      <p className="text-xs font-semibold uppercase text-gray-400">
        Location
      </p>

      <input
        type="text"
        placeholder="Current Location"
        className="mt-2 w-full bg-transparent outline-none text-[#1F2937]"
      />

    </div>

    {/* Category */}

    <div className="rounded-2xl border border-pink-100 px-5 py-4">

      <p className="text-xs font-semibold uppercase text-gray-400">
        Category
      </p>

      <select className="mt-2 w-full bg-transparent outline-none text-[#1F2937]">

        <option>All</option>
        <option>Hair</option>
        <option>Nails</option>
        <option>Spa</option>
        <option>Barber</option>
        <option>Makeup</option>

      </select>

    </div>

    {/* Search Button */}

    <button className="rounded-2xl bg-[#D97CA5] px-10 py-4 font-semibold text-white transition hover:bg-[#C86894]">
      Search
    </button>

  </div>

</div>

</section>

        {/* Hero */}

        <section className="border-b border-pink-100 bg-gradient-to-b from-[#FFF4F8] to-white">

          <div className="mx-auto max-w-7xl px-6 py-16">

            <h1 className="text-5xl font-bold text-[#1F2937]">
              Explore Beauty Professionals
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              Discover top-rated salons, spas, barbers, nail artists and makeup professionals near you.
            </p>

          </div>

        </section>

        {/* Categories */}

<section className="mx-auto mt-10 max-w-7xl px-6">

<div className="flex flex-wrap gap-4">

  <button className="rounded-full bg-[#D97CA5] px-6 py-3 font-medium text-white shadow-md">
    All
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💇 Hair
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💅 Nails
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💈 Barber
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💄 Makeup
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💆 Spa
  </button>

</div>

</section>

        {/* Content */}
        <section className="mx-auto max-w-7xl px-6 py-16">

  <h2 className="mb-8 text-3xl font-bold text-[#1F2937]">
    Popular Professionals
  </h2>

  <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

    <BusinessCard />
    <BusinessCard />
    <BusinessCard />
    <BusinessCard />
    <BusinessCard />
    <BusinessCard />

  </div>

</section>

         

      </main>

      <Footer />
    </>
  );
}

export default Explore;
{/* Search Section */}

<section className="mx-auto -mt-10 max-w-7xl px-6 relative z-10">

<div className="rounded-3xl bg-white p-4 shadow-xl border border-pink-100">

  <div className="grid gap-4 lg:grid-cols-[2fr_1.5fr_1.2fr_auto]">

    {/* Service */}

    <div className="rounded-2xl border border-pink-100 px-5 py-4">

      <p className="text-xs font-semibold uppercase text-gray-400">
        Service
      </p>

      <input
        type="text"
        placeholder="Hair, Nails, Spa..."
        className="mt-2 w-full bg-transparent outline-none text-[#1F2937]"
      />

    </div>

    {/* Location */}

    <div className="rounded-2xl border border-pink-100 px-5 py-4">

      <p className="text-xs font-semibold uppercase text-gray-400">
        Location
      </p>

      <input
        type="text"
        placeholder="Current Location"
        className="mt-2 w-full bg-transparent outline-none text-[#1F2937]"
      />

    </div>

    {/* Category */}

    <div className="rounded-2xl border border-pink-100 px-5 py-4">

      <p className="text-xs font-semibold uppercase text-gray-400">
        Category
      </p>

      <select className="mt-2 w-full bg-transparent outline-none text-[#1F2937]">

        <option>All</option>
        <option>Hair</option>
        <option>Nails</option>
        <option>Spa</option>
        <option>Barber</option>
        <option>Makeup</option>

      </select>

    </div>

    {/* Search Button */}

    <button className="rounded-2xl bg-[#D97CA5] px-10 py-4 font-semibold text-white transition hover:bg-[#C86894]">
      Search
    </button>

  </div>

</div>

</section>

{/* Categories */}

<section className="mx-auto mt-10 max-w-7xl px-6">

<div className="flex flex-wrap gap-4">

  <button className="rounded-full bg-[#D97CA5] px-6 py-3 font-medium text-white shadow-md">
    All
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💇 Hair
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💅 Nails
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💈 Barber
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💄 Makeup
  </button>

  <button className="rounded-full border border-pink-100 bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:border-[#D97CA5] hover:text-[#D97CA5]">
    💆 Spa
  </button>

</div>

</section>