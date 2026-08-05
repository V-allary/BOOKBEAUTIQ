function FeaturedProfessionals() {
    const professionals = [
      {
        name: "Glow Beauty Lounge",
        location: "Dubai",
        rating: "4.9",
        price: "From AED 120",
        image:
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
      },
      {
        name: "Luxury Barber",
        location: "Nairobi",
        rating: "4.8",
        price: "From KES 900",
        image:
          "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800",
      },
      {
        name: "Bella Spa",
        location: "Kampala",
        rating: "5.0",
        price: "From UGX 80,000",
        image:
          "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800",
      },
    ];
  
    return (
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
  
          <div className="mb-12 flex items-center justify-between">
            <div>
              <p className="font-semibold uppercase tracking-[4px] text-[#D9468F]">
                Featured
              </p>
  
              <h2 className="mt-2 text-4xl font-bold text-[#1F2937]">
                Beauty Professionals
              </h2>
            </div>
  
            <button className="rounded-full border border-pink-100 px-6 py-3 transition hover:bg-pink-50">
              View All
            </button>
          </div>
  
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
  
            {professionals.map((professional) => (
  
              <div
                key={professional.name}
                className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
  
                <img
                  src={professional.image}
                  alt={professional.name}
                  className="h-64 w-full object-cover"
                />
  
                <div className="p-6">
  
                  <div className="mb-3 flex items-center justify-between">
  
                    <h3 className="text-xl font-bold">
                      {professional.name}
                    </h3>
  
                    <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-semibold text-[#D9468F]">
                      ⭐ {professional.rating}
                    </span>
  
                  </div>
  
                  <p className="text-gray-500">
                    📍 {professional.location}
                  </p>
  
                  <p className="mt-5 font-semibold text-[#D9468F]">
                    {professional.price}
                  </p>
  
                  <button className="mt-6 w-full rounded-full bg-[#D9468F] py-3 font-semibold text-white transition hover:bg-[#C93A80]">
                    Book Now
                  </button>
  
                </div>
  
              </div>
  
            ))}
  
          </div>
  
        </div>
      </section>
    );
  }
  
  export default FeaturedProfessionals;