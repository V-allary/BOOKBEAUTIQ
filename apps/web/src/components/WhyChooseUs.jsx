function WhyChooseUs() {
    const features = [
      {
        title: "Verified Professionals",
        text: "Book trusted salons and beauty experts.",
        icon: "✔️",
      },
      {
        title: "Instant Booking",
        text: "Book appointments in seconds.",
        icon: "⚡",
      },
      {
        title: "Secure Payments",
        text: "Safe and reliable checkout.",
        icon: "🔒",
      },
      {
        title: "Real Reviews",
        text: "See genuine customer ratings.",
        icon: "⭐",
      },
    ];
  
    return (
      <section className="bg-[#FFFBFA] py-24">
        <div className="mx-auto max-w-7xl px-6">
  
          <h2 className="mb-12 text-center text-4xl font-bold">
            Why Choose BookBeautiq?
          </h2>
  
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
  
            {features.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-5 text-5xl">{item.icon}</div>
  
                <h3 className="mb-3 text-xl font-semibold">
                  {item.title}
                </h3>
  
                <p className="text-gray-500">
                  {item.text}
                </p>
              </div>
            ))}
  
          </div>
  
        </div>
      </section>
    );
  }
  
  export default WhyChooseUs;