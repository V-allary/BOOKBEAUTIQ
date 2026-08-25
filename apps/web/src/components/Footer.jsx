import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#242424] text-white">

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =========================
            MAIN FOOTER
        ========================== */}

        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-16">

          {/* Brand */}

          <div className="max-w-md">

            <Link
              to="/"
              className="inline-block text-3xl font-bold tracking-tight"
            >
              <span className="text-white">Book</span>
              <span className="text-[#B96882]">Beautiq</span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/55 sm:text-base">
              Discover and book trusted beauty professionals
              across Africa. From salons and spas to barbers,
              nail artists and makeup professionals.
            </p>

            {/* Social */}

            <div className="mt-7 flex items-center gap-3">

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/60 transition hover:border-[#B96882] hover:text-[#B96882]"
              >
                IG
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/60 transition hover:border-[#B96882] hover:text-[#B96882]"
              >
                FB
              </a>

              <a
                href="#"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/60 transition hover:border-[#B96882] hover:text-[#B96882]"
              >
                TK
              </a>

            </div>

          </div>

          {/* Explore */}

          <div>

            <h3 className="text-sm font-semibold text-white">
              Explore
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <Link
                  to="/explore"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Explore
                </Link>
              </li>

              <li>
                <Link
                  to="/categories"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Categories
                </Link>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Hair
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Nails
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Spa
                </a>
              </li>

            </ul>

          </div>

          {/* Company */}

          <div>

            <h3 className="text-sm font-semibold text-white">
              Company
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <a
                  href="#"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  About BookBeautiq
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Careers
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Blog
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Contact
                </a>
              </li>

            </ul>

          </div>

          {/* Businesses */}

          <div>

            <h3 className="text-sm font-semibold text-white">
              For Businesses
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <Link
                  to="/businesses"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  List Your Business
                </Link>
              </li>

              <li>
                <Link
                  to="/signin"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Business Login
                </Link>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Help Center
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-sm text-white/50 transition hover:text-[#B96882]"
                >
                  Privacy Policy
                </a>
              </li>

            </ul>

          </div>

        </div>

        {/* =========================
            BOTTOM BAR
        ========================== */}

        <div className="flex flex-col gap-5 border-t border-white/10 py-7 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-white/35">
            ©️ 2026 BookBeautiq. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-5 text-xs text-white/35">

            <a
              href="#"
              className="transition hover:text-[#B96882]"
            >
              Privacy
            </a>

            <a
              href="#"
              className="transition hover:text-[#B96882]"
            >
              Terms
            </a>

            <a
              href="#"
              className="transition hover:text-[#B96882]"
            >
              Cookies
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;