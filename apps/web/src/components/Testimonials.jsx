import { useEffect, useState } from "react";
import { API_URL } from "../config";

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/platform-reviews/public?limit=6`);
        const data = await response.json();
        if (response.ok) setTestimonials(data);
      } catch (error) {
        console.error("Error loading testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Nothing approved yet — stay quiet rather than show empty cards
  // or placeholder content on a live homepage.
  if (!loading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FAFAFA] py-16 sm:py-20 lg:py-24">

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =========================
            HEADER
        ========================== */}

        <div className="mb-10 text-center sm:mb-12">

          <p className="text-xs font-bold uppercase tracking-[3px] text-[#D97CA5]">
            Loved by our community
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
            What our customers say
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#777] sm:text-base">
            Real experiences from people discovering and booking
            beauty professionals through BookBeautiq.
          </p>

        </div>

        {/* =========================
            TESTIMONIALS
        ========================== */}

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-[24px] border border-[#E9E5E8] bg-white"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">

            {testimonials.map((testimonial) => (

              <article
                key={testimonial._id}
                className="group relative rounded-[24px] border border-[#E9E5E8] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(40,30,40,0.09)] sm:p-8"
              >

                {/* Quote */}

                <div className="text-5xl font-serif leading-none text-[#D97CA5]/30">
                  "
                </div>

                {/* Stars */}

                <div className="mt-4 flex gap-1 text-sm text-[#D97CA5]">
                  {"★".repeat(testimonial.rating)}
                  <span className="text-[#E5E2DF]">
                    {"★".repeat(5 - testimonial.rating)}
                  </span>
                </div>

                {/* Review */}

                <p className="mt-5 text-[15px] leading-7 text-[#555]">
                  {testimonial.comment}
                </p>

                {/* Customer */}

                <div className="mt-7 flex items-center gap-3 border-t border-[#F0ECEF] pt-5">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7E7EE] text-sm font-bold text-[#B85E83]">
                    {testimonial.displayName.charAt(0)}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#222]">
                      {testimonial.displayName}
                    </h3>

                    <p className="mt-0.5 text-xs text-[#999]">
                      {testimonial.role === "business" ? "Business owner" : "Verified customer"}
                    </p>
                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

        {/* =========================
            TRUST INDICATOR
        ========================== */}

        <div className="mt-10 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">

          <div className="flex text-sm text-[#D97CA5]">
            ★★★★★
          </div>

          <p className="text-sm text-[#777]">
            Trusted by beauty lovers across Africa
          </p>

        </div>

      </div>

    </section>
  );
}

export default Testimonials;