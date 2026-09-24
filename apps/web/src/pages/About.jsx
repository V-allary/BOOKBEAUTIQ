import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAFAF9]">

        {/* HERO */}
        <section className="border-b border-[#ECE9E6] bg-gradient-to-br from-[#FFF9FB] via-[#F8EEF2] to-[#FAFAF9] px-5 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
              About Us
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#242424] sm:text-5xl">
              Built for Africa's beauty industry.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              BookBeautiq connects customers with trusted beauty and wellness
              professionals, and gives businesses the tools to manage bookings,
              get discovered, and grow — all in one place.
            </p>
          </div>
        </section>

        {/* MISSION */}
        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6">

          <div className="grid gap-10 sm:grid-cols-2">

            <div>
              <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
                Our Mission
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#242424]">
                Making beauty services easier to find and book.
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Finding a trustworthy salon, barber, nail artist or spa
                shouldn't mean scrolling through endless social media pages.
                BookBeautiq brings verified beauty professionals into one
                place, so customers can search, compare, and book with
                confidence.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
                For Businesses
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#242424]">
                Everything needed to run and grow.
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Beyond bookings, BookBeautiq gives business owners a real
                dashboard — managing services, staff, payouts, customer
                messages, and reviews — so they can spend less time on
                admin and more time on their craft.
              </p>
            </div>

          </div>

        </section>

        {/* VALUES */}
        <section className="border-y border-[#ECE9E6] bg-white px-5 py-16 sm:px-6">

          <div className="mx-auto max-w-5xl">

            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
                What We Value
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#242424]">
                Trust, first.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">

              <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2E8EC] text-[#9D536D]">
                  ✓
                </div>
                <h3 className="mt-4 font-bold text-[#242424]">
                  Verified Businesses
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Every business goes through identity and business
                  verification before their listing goes live.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2E8EC] text-[#9D536D]">
                  ◆
                </div>
                <h3 className="mt-4 font-bold text-[#242424]">
                  Secure Payments
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Deposits are processed securely and settled directly to
                  each business's own account — BookBeautiq never holds
                  customer funds.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5E2DF] bg-[#FAFAF9] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2E8EC] text-[#9D536D]">
                  ★
                </div>
                <h3 className="mt-4 font-bold text-[#242424]">
                  Real Reviews
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Reviews come only from customers who've actually
                  completed a booking — no fake ratings.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6">

          <div className="rounded-[28px] bg-[#242424] px-8 py-14 text-center sm:px-14">

            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to get started?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-300">
              Whether you're looking for your next beauty appointment or
              ready to list your business, BookBeautiq is built for you.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/explore"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#242424] transition hover:bg-gray-100"
              >
                Explore Services
              </Link>

              <Link
                to="/businesses"
                className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                List Your Business
              </Link>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default About;