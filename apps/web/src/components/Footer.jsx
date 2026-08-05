function Footer() {
    return (
      <footer className="bg-[#1F2937] text-white">
  
        <div className="mx-auto max-w-7xl px-6 py-16">
  
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
  
            {/* Brand */}
  
            <div className="lg:col-span-2">
  
              <h2 className="text-3xl font-bold">
                <span className="text-white">Book</span>
                <span className="text-[#D97CA5]">Beautiq</span>
              </h2>
  
              <p className="mt-5 leading-7 text-gray-300">
                Discover and book trusted beauty professionals across Africa.
                From salons and spas to barbers and makeup artists,
                everything you need is in one place.
              </p>
  
            </div>
  
            {/* Explore */}
  
            <div>
  
              <h3 className="mb-4 font-semibold">Explore</h3>
  
              <ul className="space-y-3 text-gray-300">
  
                <li><a href="#">Hair</a></li>
                <li><a href="#">Nails</a></li>
                <li><a href="#">Spa</a></li>
                <li><a href="#">Barbers</a></li>
  
              </ul>
  
            </div>
  
            {/* Company */}
  
            <div>
  
              <h3 className="mb-4 font-semibold">Company</h3>
  
              <ul className="space-y-3 text-gray-300">
  
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
  
              </ul>
  
            </div>
  
            {/* Businesses */}
  
            <div>
  
              <h3 className="mb-4 font-semibold">Businesses</h3>
  
              <ul className="space-y-3 text-gray-300">
  
                <li><a href="#">Join BookBeautiq</a></li>
                <li><a href="#">Business Login</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Privacy Policy</a></li>
  
              </ul>
  
            </div>
  
          </div>
  
          <div className="mt-16 border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between">
  
            <p className="text-gray-400 text-sm">
              © 2026 BookBeautiq. All rights reserved.
            </p>
  
            <div className="mt-4 flex gap-6 md:mt-0 text-gray-400">
  
              <a href="#">Instagram</a>
              <a href="#">Facebook</a>
              <a href="#">TikTok</a>
  
            </div>
  
          </div>
  
        </div>
  
      </footer>
    );
  }
  
  export default Footer;