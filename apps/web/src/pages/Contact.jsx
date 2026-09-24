import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(formData.subject || "Contact from BookBeautiq");
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );

    window.location.href = `mailto:hello@bookbeautiq.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAFAF9]">

        <section className="border-b border-[#ECE9E6] bg-gradient-to-br from-[#FFF9FB] via-[#F8EEF2] to-[#FAFAF9] px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
              Contact
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#242424] sm:text-5xl">
              Get in touch
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-600">
              Have a question, ran into an issue, or want to report something?
              Send us a message and our team will get back to you.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-5 py-14 sm:px-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[28px] border border-[#E5E2DF] bg-white p-6 shadow-sm sm:p-8"
          >

            <div className="grid gap-4 sm:grid-cols-2">

              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#B96882]"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#B96882]"
                required
              />

            </div>

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#B96882]"
            />

            <textarea
              name="message"
              placeholder="How can we help?"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full rounded-xl border border-[#DDDAD7] bg-[#FAFAF9] p-3.5 text-sm outline-none transition focus:border-[#B96882]"
              required
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-[#242424] py-4 text-sm font-bold text-white transition hover:bg-[#B96882]"
            >
              Send Message
            </button>

            <p className="text-center text-xs text-gray-400">
              This will open your email app with your message pre-filled,
              addressed to bookbeautiq@gmail.com.
            </p>

          </form>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default Contact;