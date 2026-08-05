function Categories() {
    const categories = [
      { icon: "💇", name: "Hair" },
      { icon: "💅", name: "Nails" },
      { icon: "💈", name: "Barber" },
      { icon: "💆", name: "Spa" },
      { icon: "💄", name: "Makeup" },
      { icon: "👁️", name: "Lashes" },
      { icon: "✨", name: "Skincare" },
      { icon: "💍", name: "Bridal" },
    ];
  
    return (
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
  
          <div className="mb-14 text-center">
  
            <h2 className="text-4xl font-bold text-[#1F2937]">
              Browse Categories
            </h2>
  
            <p className="mt-4 text-gray-500">
              Find the perfect beauty service in seconds.
            </p>
  
          </div>
  
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
  
            {categories.map((category) => (
              <div
                key={category.name}
                className="cursor-pointer rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-4 text-5xl">
                  {category.icon}
                </div>
  
                <h3 className="text-lg font-semibold text-[#1F2937]">
                  {category.name}
                </h3>
              </div>
            ))}
  
          </div>
  
        </div>
      </section>
    );
  }
  
  export default Categories;