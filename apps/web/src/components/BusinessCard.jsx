import { Link } from "react-router-dom";

function BusinessCard({ business }) {
  const imageUrl = business.image
    ? business.image.startsWith("/uploads/")
      ? `http://localhost:5001${business.image}`
      : business.image
    : "";

  const rating = Number(business.rating || 0);

  return (
    <Link
      to={`/business/${business._id}`}
      className="group block overflow-hidden rounded-[24px] border border-[#ECE9E6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D9B7C3] hover:shadow-[0_14px_40px_rgba(20,23,26,0.08)]"
    >
      {/* ==========================================
          BUSINESS IMAGE
      ========================================== */}

      <div className="relative h-64 overflow-hidden bg-[#F2E8EC]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={business.name || "Beauty business"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#F2E8EC]">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#9D536D] shadow-sm">
                {business.name?.charAt(0)?.toUpperCase() || "B"}
              </div>

              <p className="mt-3 text-xs font-semibold text-[#9D536D]">
                {business.name || "Beauty Business"}
              </p>
            </div>
          </div>
        )}

        {/* Image overlay */}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />

        {/* Category */}

        {business.category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/95 px-3 py-1.5 text-xs font-bold text-[#9D536D] shadow-sm backdrop-blur-sm">
            {business.category}
          </span>
        )}

        {/* Verified */}

        {business.status === "approved" && (
          <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm backdrop-blur-sm">
            ✓ Verified
          </span>
        )}
      </div>

      {/* ==========================================
          BUSINESS CONTENT
      ========================================== */}

      <div className="p-5">
        {/* Name + Rating */}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-[#14171A]">
              {business.name}
            </h3>

            {business.location && (
              <p className="mt-1 truncate text-sm text-gray-500">
                <span className="mr-1 text-[#9D536D]">●</span>
                {business.location}
              </p>
            )}
          </div>

          {/* Rating */}

          <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#F2E8EC] px-2.5 py-1.5">
            <span className="text-sm text-[#9D536D]">
              ★
            </span>

            <span className="text-xs font-bold text-[#14171A]">
              {rating > 0 ? rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>

        {/* Description */}

        {business.description && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
            {business.description}
          </p>
        )}

        {/* Divider */}

        <div className="my-5 border-t border-[#ECE9E6]" />

        {/* Price + CTA */}

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Starting from
            </p>

            <p className="mt-1 truncate text-lg font-bold text-[#9D536D]">
              {business.price || "Contact Business"}
            </p>
          </div>

          <span className="shrink-0 rounded-xl bg-[#9D536D] px-4 py-2.5 text-xs font-bold text-white transition group-hover:bg-[#85445B]">
            View Profile →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default BusinessCard;