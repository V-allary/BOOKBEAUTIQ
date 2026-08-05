function PopularCities() {
    const cities = [
      "Dubai",
      "Abu Dhabi",
      "Nairobi",
      "Mombasa",
      "Kampala",
      "Kigali",
      "Dar es Salaam",
      "Johannesburg",
    ];
  
    return (
      <section className="bg-[#FFFDFE] py-20">
        <div className="mx-auto max-w-7xl px-6">
  
          <h2 className="text-4xl font-bold text-center text-[#1F2937]">
            Explore by City
          </h2>
  
          <p className="mt-4 text-center text-gray-500">
            Discover top-rated beauty professionals near you.
          </p>
  
          <div className="mt-12 flex flex-wrap justify-center gap-4">
  
            {cities.map((city) => (
              <button
                key={city}
                className="rounded-full border border-[#F7D7E5] bg-white px-6 py-3 font-medium text-[#1F2937] transition hover:bg-[#FFF4F8] hover:border-[#D97CA5]"
              >
                {city}
              </button>
            ))}
  
          </div>
  
        </div>
      </section>
    );
  }
  
  export default PopularCities;