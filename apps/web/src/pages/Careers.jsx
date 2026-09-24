import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Careers() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAFAF9]">

        <section className="border-b border-[#ECE9E6] bg-gradient-to-br from-[#FFF9FB] via-[#F8EEF2] to-[#FAFAF9] px-5 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
              Careers
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#242424] sm:text-5xl">
              Join us in building BookBeautiq.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-600">
              We're not currently hiring for any open positions, but we're
              always happy to hear from people who'd like to be part of
              what we're building.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-5 py-16 sm:px-6">

          <div className="rounded-[28px] border border-[#E5E2DF] bg-white p-8 text-center shadow-sm sm:p-10">

            <h2 className="text-xl font-bold text-[#242424]">
              No open roles right now
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              If that changes, we'll list positions here. In the meantime,
              feel free to reach out and tell us a bit about yourself —
              we'll keep it on file.
            </p>

            <a
              href="mailto:hello@bookbeautiq.com?subject=Interested%20in%20joining%20BookBeautiq"
              className="mt-6 inline-block rounded-xl bg-[#242424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B96882]"
            >
              Get In Touch
            </a>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default Careers;