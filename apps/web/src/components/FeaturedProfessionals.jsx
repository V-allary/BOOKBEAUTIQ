import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function FeaturedProfessionals() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const recommendedRef = useRef(null);
  const newRef = useRef(null);
  const popularRef = useRef(null);

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

        setBusinesses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(
          "Error loading featured businesses:",
          error
        );

        setError("Unable to load professionals right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  /*
   * ------------------------------------------
   * BUSINESS GROUPS
   * ------------------------------------------
   */

  // Recommended:
  // We use the approved businesses as the marketplace
  // pool. The first 12 become the initial recommendations.
  const recommendedBusinesses = businesses.slice(0, 12);

  // New:
  // Newest businesses first when createdAt exists.
  // If older records don't have createdAt, we safely
  // fall back to the original order.
  const newBusinesses = [...businesses]
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;

      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    })
    .slice(0, 12);

  // Popular:
  // Highest rating first.
  // Businesses without ratings safely fall toward
  // the bottom.
  const popularBusinesses = [...businesses]
    .sort((a, b) => {
      const ratingA = Number(a.rating || 0);
      const ratingB = Number(b.rating || 0);

      return ratingB - ratingA;
    })
    .slice(0, 12);

  /*
   * ------------------------------------------
   * HORIZONTAL SCROLL
   * ------------------------------------------
   */

  const scrollRow = (ref, direction) => {
    if (!ref.current) return;

    const amount =
      ref.current.clientWidth * 0.85;

    ref.current.scrollBy({
      left:
        direction === "next"
          ? amount
          : -amount,
      behavior: "smooth",
    });
  };

  /*
   * ------------------------------------------
   * BUSINESS CARD
   * ------------------------------------------
   */

  const BusinessCard = ({ business }) => {
    const image =
      business.image?.startsWith("/uploads/")
        ? `http://localhost:5001${business.image}`
        : business.image;

    const rating =
      business.rating ||
      business.averageRating ||
      "New";

    return (
      <article className="group relative min-w-[82%] overflow-hidden rounded-[24px] border border-[#ECE8EC] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(40,30,40,0.12)] sm:min-w-[48%] lg:min-w-[calc(25%-18px)]">

        {/* Image */}

        <Link
          to={`/business/${business._id}`}
          className="block"
        >
          <div className="relative h-56 overflow-hidden bg-[#F3EFEC] sm:h-60">

            {image ? (
              <img
                src={image}
                alt={business.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No image available
              </div>
            )}

            {/* Verified badge */}

            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#222] shadow-sm backdrop-blur">
              <span className="text-green-600">✓</span>
              Verified
            </div>

            {/* Rating */}

            {rating !== "New" && (
              <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#222] shadow-sm backdrop-blur">
                ★ {rating}
              </div>
            )}

          </div>
        </Link>

        {/* Content */}

        <div className="p-5">

          <div className="min-w-0">

            <Link
              to={`/business/${business._id}`}
              className="block truncate text-lg font-bold text-[#171717] transition hover:text-[#D97CA5]"
            >
              {business.name}
            </Link>

            <p className="mt-1 truncate text-sm text-gray-500">
              {business.category ||
                "Beauty & Wellness"}
            </p>

          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <span className="text-[#D97CA5]">
              ⌖
            </span>

            <span className="truncate">
              {business.location ||
                "Location unavailable"}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[#F0ECEF] pt-4">

            <div className="min-w-0">

              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400">
                Starting from
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-[#333]">
                {business.price ||
                  "View services"}
              </p>

            </div>

            <Link
              to={`/business/${business._id}`}
              className="shrink-0 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D97CA5]"
            >
              View
            </Link>

          </div>

        </div>

      </article>
    );
  };

  /*
   * ------------------------------------------
   * SECTION ROW
   * ------------------------------------------
   */

  const BusinessRow = ({
    title,
    eyebrow,
    description,
    businesses: rowBusinesses,
    scrollRef,
  }) => {
    if (!rowBusinesses.length) return null;

    return (
      <section className="mb-16 last:mb-0">

        {/* Header */}

        <div className="mb-7 flex items-end justify-between gap-6">

          <div>

            <p className="text-xs font-bold uppercase tracking-[3px] text-[#D97CA5]">
              {eyebrow}
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#171717] sm:text-3xl">
              {title}
            </h2>

            {description && (
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                {description}
              </p>
            )}

          </div>

          {/* Desktop arrows */}

          {rowBusinesses.length > 4 && (
            <div className="hidden shrink-0 gap-2 sm:flex">

              <button
                type="button"
                onClick={() =>
                  scrollRow(
                    scrollRef,
                    "prev"
                  )
                }
                aria-label={`Previous ${title}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DED9DE] bg-white text-lg text-[#333] transition hover:border-[#D97CA5] hover:text-[#D97CA5]"
              >
                ←
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollRow(
                    scrollRef,
                    "next"
                  )
                }
                aria-label={`Next ${title}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DED9DE] bg-white text-lg text-[#333] transition hover:border-[#D97CA5] hover:text-[#D97CA5]"
              >
                →
              </button>

            </div>
          )}

        </div>

        {/* Cards */}

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >

          {rowBusinesses.map((business) => (
            <BusinessCard
              key={`${title}-${business._id}`}
              business={business}
            />
          ))}

        </div>

        {/* Mobile hint */}

        {rowBusinesses.length > 1 && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400 sm:hidden">
            <span>Swipe to explore</span>
            <span>→</span>
          </div>
        )}

      </section>
    );
  };

  /*
   * ------------------------------------------
   * RENDER
   * ------------------------------------------
   */

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* Main heading */}

        <div className="mb-12 max-w-2xl">

          <p className="text-xs font-bold uppercase tracking-[3px] text-[#D97CA5]">
            BookBeautiq
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
            Find your perfect beauty spot
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
            Explore verified beauty professionals and
            discover a place that fits your style,
            location and budget.
          </p>

        </div>

        {/* Loading */}

        {loading && (

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="overflow-hidden rounded-[24px] border border-[#ECE8EC] bg-white"
              >

                <div className="h-60 animate-pulse bg-[#F3EFEC]" />

                <div className="space-y-3 p-5">

                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#F3EFEC]" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#F3EFEC]" />

                  <div className="h-4 w-1/3 animate-pulse rounded bg-[#F3EFEC]" />

                </div>

              </div>

            ))}

          </div>

        )}

        {/* Error */}

        {!loading && error && (

          <div className="rounded-3xl border border-red-100 bg-[#FFFAFA] p-10 text-center">

            <h3 className="text-lg font-bold text-[#171717]">
              We couldn't load professionals
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

          </div>

        )}

        {/* Actual business rows */}

        {!loading &&
          !error &&
          businesses.length > 0 && (
            <>

              <BusinessRow
                eyebrow="Curated for you"
                title="Recommended"
                description="A selection of verified professionals worth discovering."
                businesses={recommendedBusinesses}
                scrollRef={recommendedRef}
              />

              <BusinessRow
                eyebrow="Just joined"
                title="New on BookBeautiq"
                description="Discover businesses that have recently joined the platform."
                businesses={newBusinesses}
                scrollRef={newRef}
              />

              <BusinessRow
                eyebrow="Community favourites"
                title="Popular right now"
                description="Highly rated professionals getting attention from our community."
                businesses={popularBusinesses}
                scrollRef={popularRef}
              />

            </>
          )}

        {/* No businesses */}

        {!loading &&
          !error &&
          businesses.length === 0 && (

            <div className="rounded-3xl border border-[#ECE8EC] bg-[#FFFBF8] p-12 text-center">

              <h3 className="text-xl font-bold text-[#171717]">
                Businesses are coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Verified beauty professionals will appear
                here as they join BookBeautiq.
              </p>

            </div>

          )}

      </div>

    </section>
  );
}

export default FeaturedProfessionals;