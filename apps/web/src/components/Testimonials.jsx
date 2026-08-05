function Testimonials() {
    const testimonials = [
      {
        name: "Sarah M.",
        review:
          "BookBeautiq made it so easy to find an amazing nail artist near me.",
      },
      {
        name: "James K.",
        review:
          "I booked a barber in under two minutes. The experience was seamless.",
      },
      {
        name: "Aisha O.",
        review:
          "The best beauty booking platform I've used. Clean, fast and reliable.",
      },
    ];
  
    return (
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
  
          <h2 className="mb-12 text-center text-4xl font-bold text-[#1F2937]">
            What Our Customers Say
          </h2>
  
          <div className="grid gap-8 lg:grid-cols-3">
  
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-3xl border border-pink-100 bg-[#FFFBFA] p-8 shadow-sm"
              >
                <p className="text-gray-600 leading-7">
                  "{testimonial.review}"
                </p>
  
                <h3 className="mt-6 font-semibold text-[#D9468F]">
                  {testimonial.name}
                </h3>
              </div>
            ))}
  
          </div>
  
        </div>
      </section>
    );
  }
  
  export default Testimonials;