import { useState } from "react";
import { Link } from "react-router-dom";

function ForBusinesses() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const businessTypes = [
    "Salons",
    "Barbers",
    "Nail Artists",
    "Spas",
    "Makeup Artists",
    "Lash Artists",
    "Massage",
    "Wellness",
  ];

  const features = [
    {
      title: "Smart Scheduling",
      description: "Keep appointments, staff and availability organized.",
    },
    {
      title: "Online Bookings",
      description: "Let customers discover and book you 24/7.",
    },
    {
      title: "Business Profile",
      description: "Showcase your services, team, prices and brand.",
    },
    {
      title: "Customer Messages",
      description: "Stay connected with customers before their appointments.",
    },
    {
      title: "Secure Payments",
      description: "Receive booking deposits through BookBeautiq.",
    },
  ];

  const benefits = [
    {
      number: "01",
      title: "Get discovered",
      description:
        "Put your business in front of customers actively looking for beauty and wellness services.",
    },
    {
      number: "02",
      title: "Manage everything",
      description:
        "Manage bookings, services, staff and customer conversations from one simple dashboard.",
    },
    {
      number: "03",
      title: "Build your reputation",
      description:
        "Collect reviews and create a professional online presence customers can trust.",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for independent beauty professionals getting started.",
      features: [
        "Business profile",
        "Service listings",
        "Online bookings",
        "Customer messages",
      ],
      button: "Get Started",
      featured: false,
    },
    {
      name: "Professional",
      price: "Coming Soon",
      description: "Powerful tools for growing beauty businesses and teams.",
      features: [
        "Everything in Starter",
        "Team management",
        "Advanced booking tools",
        "Business insights",
        "Priority support",
      ],
      button: "Join the Waitlist",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Flexible solutions for larger beauty and wellness brands.",
      features: [
        "Everything in Professional",
        "Multiple locations",
        "Advanced management",
        "Dedicated support",
      ],
      button: "Contact Us",
      featured: false,
    },
  ];

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF8] text-[#1F2937]">

      {/* =====================================================
          BUSINESS NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#EEE6EA] bg-[#FFFBF8]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          {/* Logo */}

          <Link
            to="/"
            className="text-2xl font-bold tracking-[-1px] lg:text-3xl"
          >
            <span className="text-[#1F2937]">Book</span>
            <span className="text-[#B96882]">Beautiq</span>
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-8 lg:flex">

            {/* Business Types */}

            <div className="relative">

              <button
                type="button"
                onClick={() => toggleMenu("business")}
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  openMenu === "business"
                    ? "text-[#B96882]"
                    : "text-[#4B5563] hover:text-[#B96882]"
                }`}
              >
                Business types
                <span
                  className={`text-xs transition ${
                    openMenu === "business" ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {openMenu === "business" && (
                <div className="absolute left-1/2 top-12 w-64 -translate-x-1/2 rounded-3xl border border-[#EEE7EA] bg-white p-4 shadow-[0_20px_60px_rgba(31,41,55,0.12)]">

                  <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Built for your business
                  </p>

                  <div className="space-y-1">
                    {businessTypes.map((type) => (
                      <a
                        key={type}
                        href="#business-types"
                        onClick={() => setOpenMenu(null)}
                        className="block rounded-xl px-3 py-2.5 text-sm text-gray-600 transition hover:bg-[#FFF4F8] hover:text-[#B96882]"
                      >
                        {type}
                      </a>
                    ))}
                  </div>

                </div>
              )}

            </div>

            {/* Features */}

            <div className="relative">

              <button
                type="button"
                onClick={() => toggleMenu("features")}
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  openMenu === "features"
                    ? "text-[#B96882]"
                    : "text-[#4B5563] hover:text-[#B96882]"
                }`}
              >
                Features
                <span
                  className={`text-xs transition ${
                    openMenu === "features" ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {openMenu === "features" && (
                <div className="absolute left-1/2 top-12 w-80 -translate-x-1/2 rounded-3xl border border-[#EEE7EA] bg-white p-5 shadow-[0_20px_60px_rgba(31,41,55,0.12)]">

                  <div className="space-y-1">

                    {features.slice(0, 4).map((feature) => (
                      <a
                        key={feature.title}
                        href="#features"
                        onClick={() => setOpenMenu(null)}
                        className="block rounded-2xl px-3 py-3 transition hover:bg-[#FFF4F8]"
                      >
                        <p className="text-sm font-semibold text-[#1F2937]">
                          {feature.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {feature.description}
                        </p>
                      </a>
                    ))}

                    <a
                      href="#features"
                      onClick={() => setOpenMenu(null)}
                      className="mt-2 block border-t border-[#F0E9EC] px-3 pt-4 text-sm font-semibold text-[#B96882]"
                    >
                      See all features →
                    </a>

                  </div>

                </div>
              )}

            </div>

            {/* Pricing */}

            <a
              href="#pricing"
              className="text-sm font-medium text-[#4B5563] transition hover:text-[#B96882]"
            >
              Pricing
            </a>

          </nav>

          {/* Desktop CTA */}

          <div className="hidden items-center gap-4 lg:flex">

            <Link
              to="/signin"
              className="text-sm font-semibold text-[#4B5563] transition hover:text-[#B96882]"
            >
              Sign in
            </Link>

            <Link
              to="/signup"
              className="rounded-full bg-[#1F2937] px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#111827] hover:shadow-lg"
            >
              Sign up
            </Link>

          </div>

          {/* Mobile Button */}

          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-full border border-[#E8DDE2] bg-white px-4 py-2 text-sm font-semibold lg:hidden"
          >
            {mobileMenu ? "Close" : "Menu"}
          </button>

        </div>

        {/* Mobile Navigation */}

        {mobileMenu && (
          <div className="border-t border-[#EEE6EA] bg-white px-6 py-6 lg:hidden">

            <div className="space-y-2">

              <a
                href="#business-types"
                onClick={() => setMobileMenu(false)}
                className="block rounded-xl px-4 py-3 font-medium hover:bg-[#FFF4F8]"
              >
                Business types
              </a>

              <a
                href="#features"
                onClick={() => setMobileMenu(false)}
                className="block rounded-xl px-4 py-3 font-medium hover:bg-[#FFF4F8]"
              >
                Features
              </a>

              <a
                href="#pricing"
                onClick={() => setMobileMenu(false)}
                className="block rounded-xl px-4 py-3 font-medium hover:bg-[#FFF4F8]"
              >
                Pricing
              </a>

              <div className="my-3 border-t border-[#F0E9EC]" />

              <Link
                to="/signin"
                className="block rounded-xl px-4 py-3 font-semibold"
              >
                Sign in
              </Link>

              <Link
                to="/signup"
                className="block rounded-xl bg-[#1F2937] px-4 py-3 text-center font-semibold text-white"
              >
                Sign up
              </Link>

            </div>

          </div>
        )}

      </header>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">

        <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-[#F7D7E5]/30 blur-3xl" />

        <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-[#FFE8F1]/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">

          <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.9fr]">

            <div>

              <div className="inline-flex items-center rounded-full border border-[#F0D8E2] bg-white px-4 py-2 text-sm font-semibold text-[#B96882] shadow-sm">
                Built for beauty businesses
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.03] tracking-[-2.5px] text-[#1F2937] md:text-6xl lg:text-7xl">
                Everything you need to{" "}
                <span className="text-[#B96882]">
                  grow your beauty business.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-gray-600">
                BookBeautiq gives beauty professionals the tools to get
                discovered, manage bookings, connect with customers and
                build a business people love.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/signup"
                  className="rounded-full bg-[#1F2937] px-8 py-4 text-center font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#111827] hover:shadow-xl"
                >
                  Get started free →
                </Link>

                <a
                  href="#features"
                  className="rounded-full border border-[#E5DDE1] bg-white px-8 py-4 text-center font-semibold text-[#1F2937] transition hover:border-[#B96882] hover:text-[#B96882]"
                >
                  Explore features
                </a>

              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-500">
                <span>✓ Easy setup</span>
                <span>✓ Online bookings</span>
                <span>✓ Secure payments</span>
              </div>

            </div>


            {/* Dashboard Preview */}

            <div className="relative">

              <div className="absolute -right-5 -top-5 z-10 rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-black/5">
                <p className="text-xs text-gray-400">
                  This month
                </p>

                <p className="mt-1 text-xl font-bold text-[#1F2937]">
                  +28.4%
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-3 shadow-[0_35px_90px_rgba(31,41,55,0.14)] ring-1 ring-[#EEE7EA]">

                <div className="overflow-hidden rounded-[1.5rem] border border-[#EEE7EA] bg-[#FAF8F9]">

                  {/* Fake dashboard header */}

                  <div className="flex items-center justify-between border-b border-[#EEE7EA] bg-white px-5 py-4">

                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#B96882]" />
                      <span className="text-sm font-bold">
                        BookBeautiq
                      </span>
                    </div>

                    <div className="h-8 w-8 rounded-full bg-[#F3DDE5]" />

                  </div>

                  <div className="p-5">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs text-gray-400">
                          Business overview
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          Good morning 👋
                        </h3>
                      </div>

                      <div className="rounded-xl bg-[#1F2937] px-4 py-2 text-xs font-semibold text-white">
                        + Add booking
                      </div>

                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">

                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs text-gray-400">
                          Bookings
                        </p>
                        <p className="mt-2 text-xl font-bold">
                          128
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs text-gray-400">
                          Customers
                        </p>
                        <p className="mt-2 text-xl font-bold">
                          84
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs text-gray-400">
                          Revenue
                        </p>
                        <p className="mt-2 text-xl font-bold">
                          42K
                        </p>
                      </div>

                    </div>

                    {/* Calendar */}

                    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">
                          Today's bookings
                        </p>

                        <span className="text-xs text-[#B96882]">
                          View all
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">

                        {[
                          ["09:00", "Amara", "Hair Styling"],
                          ["11:30", "Sarah", "Classic Nails"],
                          ["14:00", "Nadia", "Lash Extensions"],
                        ].map(([time, name, service]) => (
                          <div
                            key={time}
                            className="flex items-center gap-3 rounded-xl bg-[#FAF7F8] p-3"
                          >
                            <span className="w-12 text-xs font-semibold text-gray-400">
                              {time}
                            </span>

                            <div className="h-8 w-8 rounded-full bg-[#F2D7E1]" />

                            <div className="min-w-0">
                              <p className="text-xs font-semibold">
                                {name}
                              </p>

                              <p className="text-[11px] text-gray-400">
                                {service}
                              </p>
                            </div>

                            <span className="ml-auto rounded-full bg-[#EAF6EE] px-2 py-1 text-[10px] font-semibold text-[#4D9164]">
                              Confirmed
                            </span>
                          </div>
                        ))}

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          BUSINESS TYPES
      ====================================================== */}

      <section
        id="business-types"
        className="scroll-mt-24 border-y border-[#EEE7EA] bg-white py-20"
      >

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-wider text-[#B96882]">
              Made for your industry
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Your business belongs here.
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-500">
              Whether you run a solo beauty business or manage a growing
              team, BookBeautiq is designed to fit the way you work.
            </p>

          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">

            {businessTypes.map((type, index) => (
              <div
                key={type}
                className="group rounded-3xl border border-[#EEE7EA] bg-[#FFFCFD] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#F0C9D9] hover:shadow-lg"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF1F6] text-sm font-bold text-[#B96882]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h3 className="mt-5 font-bold text-[#1F2937]">
                  {type}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Grow your {type.toLowerCase()} business.
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className="scroll-mt-24 bg-[#FFFBF8] py-20"
      >

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-[#B96882]">
                Powerful tools
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                Run your business with confidence.
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-500">
                Stop juggling different tools. BookBeautiq brings the
                essentials together in one simple platform.
              </p>

              <Link
                to="/signup"
                className="mt-8 inline-flex rounded-full bg-[#1F2937] px-7 py-3.5 font-semibold text-white transition hover:bg-[#111827]"
              >
                Start growing →
              </Link>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`rounded-3xl border border-[#EEE7EA] bg-white p-7 shadow-sm ${
                    index === 0 ? "sm:col-span-2" : ""
                  }`}
                >

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF1F6] text-[#B96882]">
                    {index === 0 ? "✦" : "✓"}
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    {feature.description}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="bg-white py-20">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-[#B96882]">
              Simple setup
            </p>

            <h2 className="mt-3 text-4xl font-bold md:text-5xl">
              From sign-up to bookings.
            </h2>

          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">

            {benefits.map((benefit) => (
              <div
                key={benefit.number}
                className="rounded-3xl border border-[#EEE7EA] bg-[#FFFCFD] p-8"
              >

                <span className="text-sm font-bold text-[#B96882]">
                  {benefit.number}
                </span>

                <h3 className="mt-6 text-xl font-bold">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {benefit.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          PRICING
      ====================================================== */}

      <section
        id="pricing"
        className="scroll-mt-24 bg-[#FFFBF8] py-20"
      >

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-[#B96882]">
              Simple pricing
            </p>

            <h2 className="mt-3 text-4xl font-bold md:text-5xl">
              Choose what works for you.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-500">
              Start building your presence on BookBeautiq and scale
              as your business grows.
            </p>

          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">

            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-[2rem] border p-8 ${
                  plan.featured
                    ? "border-[#B96882] bg-white shadow-[0_25px_70px_rgba(217,124,165,0.16)]"
                    : "border-[#EEE7EA] bg-white"
                }`}
              >

                {plan.featured && (
                  <div className="absolute right-6 top-6 rounded-full bg-[#FFF1F6] px-3 py-1 text-xs font-bold text-[#B96882]">
                    Recommended
                  </div>
                )}

                <h3 className="text-xl font-bold">
                  {plan.name}
                </h3>

                <p className="mt-3 min-h-[48px] text-sm leading-6 text-gray-500">
                  {plan.description}
                </p>

                <div className="mt-7">

                  <p className="text-3xl font-bold">
                    {plan.price}
                  </p>

                  {plan.name === "Starter" && (
                    <p className="mt-1 text-sm text-gray-400">
                      No monthly commitment
                    </p>
                  )}

                </div>

                <div className="my-7 border-t border-[#EEE7EA]" />

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Includes
                </p>

                <ul className="mt-5 space-y-3">

                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFF1F6] text-xs font-bold text-[#B96882]">
                        ✓
                      </span>

                      {feature}
                    </li>
                  ))}

                </ul>

                {plan.name === "Starter" ? (
                  <Link
                    to="/signup"
                    className="mt-8 block rounded-full bg-[#1F2937] py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#111827]"
                  >
                    {plan.button}
                  </Link>
                ) : (
                  <a
                    href="mailto:hello@bookbeautiq.com"
                    className="mt-8 block rounded-full border border-[#DCD3D7] py-3.5 text-center text-sm font-semibold text-[#1F2937] transition hover:border-[#B96882] hover:text-[#B96882]"
                  >
                    {plan.button}
                  </a>
                )}

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="px-6 py-20">

        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#1F2937] px-8 py-16 text-center shadow-2xl md:px-16">

          <div className="mx-auto max-w-3xl">

            <p className="text-sm font-semibold uppercase tracking-wider text-[#F4B5CD]">
              Grow with BookBeautiq
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Your next customer could be looking for you right now.
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-300">
              Create your business profile and start building your
              presence on BookBeautiq.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex rounded-full bg-[#B96882] px-9 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#CC6C98] hover:shadow-xl"
            >
              List Your Business →
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#EEE7EA] bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 md:flex-row md:items-center md:justify-between lg:px-8">

          <Link
            to="/"
            className="text-xl font-bold"
          >
            <span>Book</span>
            <span className="text-[#B96882]">Beautiq</span>
          </Link>

          <p className="text-sm text-gray-400">
            ©️ {new Date().getFullYear()} BookBeautiq. All rights reserved.
          </p>

          <div className="flex gap-5 text-sm text-gray-500">
            <Link
              to="/"
              className="transition hover:text-[#B96882]"
            >
              Customer site
            </Link>

            <Link
              to="/signin"
              className="transition hover:text-[#B96882]"
            >
              Sign in
            </Link>
          </div>

        </div>

      </footer>

    </div>
  );
}

export default ForBusinesses;