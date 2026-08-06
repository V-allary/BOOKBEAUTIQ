function BusinessCard() {
    return (
      <div className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
  
        {/* Image */}
  
        <div className="relative h-64 bg-pink-100">
  
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"
            alt="Salon"
            className="h-full w-full object-cover"
          />
  
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#D97CA5] shadow">
            Featured
          </span>
  
        </div>
  
        {/* Content */}
  
        <div className="p-6">
  
          <div className="flex items-start justify-between">
  
            <div>
  
              <h3 className="text-xl font-bold text-[#1F2937]">
                Luxe Beauty Studio
              </h3>
  
              <p className="mt-1 text-gray-500">
                📍 Business Bay, Dubai
              </p>
  
            </div>
  
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
              ⭐ 4.9
            </span>
  
          </div>
  
          <p className="mt-5 text-gray-600">
            Hair • Nails • Makeup
          </p>
  
          <div className="mt-6 flex items-center justify-between">
  
            <div>
              <p className="text-sm text-gray-500">
                From
              </p>
  
              <h4 className="text-xl font-bold text-[#D97CA5]">
                AED 120
              </h4>
            </div>
  
            <button className="rounded-full bg-[#D97CA5] px-6 py-3 font-semibold text-white transition hover:bg-[#C86A93]">
              Book Now
            </button>
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  export default BusinessCard;