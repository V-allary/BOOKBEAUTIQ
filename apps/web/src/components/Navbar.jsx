import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#F1E8EC] bg-white/95 backdrop-blur-xl">

      {/* =========================
          DESKTOP + MOBILE HEADER
      ========================== */}

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-[27px] font-bold tracking-[-1.5px] sm:text-3xl"
        >
          <span className="text-[#171717]">Book</span>
          <span className="text-[#B96882]">Beautiq</span>
        </Link>

        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}

        <nav className="hidden items-center gap-9 lg:flex">

          <Link
            to="/"
            className="font-medium text-[#171717] transition hover:text-[#B96882]"
          >
            Home
          </Link>

          <Link
            to="/explore"
            className="font-medium text-[#666] transition hover:text-[#B96882]"
          >
            Explore
          </Link>

          <Link
            to="/categories"
            className="font-medium text-[#666] transition hover:text-[#B96882]"
          >
            Categories
          </Link>

          <Link
            to="/businesses"
            className="font-medium text-[#666] transition hover:text-[#B96882]"
          >
            Businesses
          </Link>

        </nav>

        {/* =========================
            DESKTOP ACTIONS
        ========================== */}

        <div className="hidden items-center gap-3 lg:flex">

          <Link
            to="/businesses"
            className="rounded-full border border-[#EADDE3] bg-white px-5 py-2.5 text-sm font-semibold text-[#171717] transition hover:border-[#B96882] hover:bg-[#FFF7FA] hover:text-[#B96882]"
          >
            List Your Business
          </Link>

          <Link
            to="/signin"
            className="rounded-full bg-[#1F2937] px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#111827] hover:shadow-lg"
            >
            Sign In
          </Link>

        </div>

        {/* =========================
            MOBILE MENU BUTTON
        ========================== */}

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EADDE3] bg-white transition hover:bg-[#FFF7FA] lg:hidden"
        >
          <div className="flex w-5 flex-col gap-1.5">
            <span
              className={`block h-[2px] w-5 bg-[#171717] transition duration-300 ${
                menuOpen ? "translate-y-[4px] rotate-45" : ""
              }`}
            />

            <span
              className={`block h-[2px] w-5 bg-[#171717] transition duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`block h-[2px] w-5 bg-[#171717] transition duration-300 ${
                menuOpen ? "-translate-y-[4px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>

      </div>

      {/* =========================
          MOBILE MENU
      ========================== */}

      {menuOpen && (
        <div className="border-t border-[#F1E8EC] bg-white px-5 pb-6 pt-4 shadow-xl lg:hidden">

          <nav className="flex flex-col">

            <Link
              to="/"
              onClick={closeMenu}
              className="border-b border-[#F3ECEF] py-4 text-base font-semibold text-[#171717]"
            >
              Home
            </Link>

            <Link
              to="/explore"
              onClick={closeMenu}
              className="border-b border-[#F3ECEF] py-4 text-base font-medium text-[#555] transition hover:text-[#B96882]"
            >
              Explore
            </Link>

            <Link
              to="/categories"
              onClick={closeMenu}
              className="border-b border-[#F3ECEF] py-4 text-base font-medium text-[#555] transition hover:text-[#B96882]"
            >
              Categories
            </Link>

            <Link
              to="/businesses"
              onClick={closeMenu}
              className="border-b border-[#F3ECEF] py-4 text-base font-medium text-[#555] transition hover:text-[#B96882]"
            >
              Businesses
            </Link>

            <div className="mt-5 grid grid-cols-2 gap-3">

              <Link
                to="/businesses"
                onClick={closeMenu}
                className="rounded-full border border-[#EADDE3] px-4 py-3 text-center text-sm font-semibold text-[#171717] transition hover:bg-[#FFF7FA]"
              >
                List Your Business
              </Link>

              <Link
                to="/signin"
                onClick={closeMenu}
                className="rounded-full bg-[#D97CA5] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#CC6C98]"
              >
                Sign In
              </Link>

            </div>

          </nav>

        </div>
      )}

    </header>
  );
}

export default Navbar;