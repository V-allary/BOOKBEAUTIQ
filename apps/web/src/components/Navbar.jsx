import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F7D7E5] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="text-3xl font-bold tracking-tight">
          <span className="text-[#1F2937]">Book</span>
          <span className="text-[#D97CA5]">Beautiq</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-10 lg:flex">

          <Link
            to="/"
            className="font-semibold text-[#1F2937]"
          >
            Home
          </Link>

          <Link
            to="/explore"
            className="font-medium text-gray-500 transition hover:text-[#D97CA5]"
          >
            Explore
          </Link>

          <Link
            to="/categories"
            className="font-medium text-gray-500 transition hover:text-[#D97CA5]"
          >
            Categories
          </Link>

          <Link
            to="/businesses"
            className="font-medium text-gray-500 transition hover:text-[#D97CA5]"
          >
            Businesses
          </Link>

        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          <Link
            to="/businesses"
            className="hidden rounded-full border border-[#F7D7E5] bg-white px-5 py-2.5 font-medium text-[#1F2937] transition hover:bg-[#FFF4F8] hover:text-[#D97CA5] lg:block"
          >
            List Your Business
          </Link>

          <Link
            to="/signin"
            className="rounded-full bg-[#D97CA5] px-6 py-2.5 font-semibold text-white shadow-md transition duration-300 hover:bg-[#CC6C98] hover:shadow-lg"
          >
            Sign In
          </Link>

        </div>

      </div>
    </header>
  );
}

export default Navbar;