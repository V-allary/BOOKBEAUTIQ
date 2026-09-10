import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function HelpCenter() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Getting Started");

  const categories = [
    "Getting Started",
    "Bookings & Payments",
    "For Businesses",
    "Account & Trust",
  ];

  const faqs = {
    "Getting Started": [
      {
        q: "How do I book an appointment on BookBeautiq?",
        a: "Search or browse for a business on the Explore page, open their profile, choose a service, professional (if applicable), date and time, then continue to checkout. You don't need an account to book — guest checkout is available, though creating an account lets you track your bookings and message businesses more easily.",
      },
      {
        q: "Do I need to create an account to book?",
        a: "No. You can book as a guest by providing your name, email and phone number at checkout. Creating a free account lets you view your booking history, message businesses, and leave reviews more easily.",
      },
      {
        q: "How do I find a specific service, like braids or a barber?",
        a: "Use the search bar on the homepage or Explore page. Searching a service name (like \"French Curl Braids\") will surface any business that offers it, not just businesses with that word in their name.",
      },
    ],
    "Bookings & Payments": [
        {
            q: "Why do I have to pay a deposit?",
            a: "A 30% deposit secures your appointment slot. It's processed securely through Paystack and goes directly to the business's own linked bank or M-Pesa account — BookBeautiq never holds or stores that money. The remaining 70% is paid directly to the business in person, using whatever payment method they accept on-site.",
          },
    
      {
        q: "How is my payment processed?",
        a: "Deposits are processed securely through Paystack. BookBeautiq never sees or stores your card details — Paystack handles the transaction directly.",
      },
      {
        q: "Can I cancel a booking?",
        a: "Yes. Go to your dashboard, find the booking, and cancel it. The business is notified immediately by email and in-app notification. Refund eligibility for deposits depends on the individual business's cancellation policy — check with them directly.",
      },
      {
        q: "What happens after my appointment?",
        a: "Once the business marks your booking as completed, you'll receive an email with a one-time link to leave a review for your experience.",
      },
      {
        q: "I see a discounted price on a service — will I be charged the discounted amount?",
        a: "Special offers are reflected on the business's page. Always check the price shown at checkout before confirming your booking.",
      },
    ],
    "For Businesses": [
      {
        q: "How do I list my business on BookBeautiq?",
        a: "Sign up and choose \"Business Owner\" as your account type. You'll be asked to verify your identity and business details before you can create a listing. Once verified, you'll complete onboarding (business info, photos, services, and staff if you're on the Team plan) and submit your listing for approval.",
      },
      {
        q: "What's the difference between the Independent and Team plans?",
        a: "The Independent plan (KES 1,500/month) is for solo professionals and doesn't include staff management. The Team plan (KES 2,500/month) includes everything in Independent plus the ability to add multiple staff members customers can choose from when booking.",
      },
      {
        q: "How does the free trial work?",
        a: "Every new business gets a 7-day free trial with no card required upfront. After 7 days, you'll be asked to pay your subscription. If unpaid, there's a grace period before your listing is temporarily hidden from customers — paying at any point restores visibility immediately.",
      },
      {
        q: "Can my subscription renew automatically?",
        a: "Yes, optionally. The first time you pay, you can choose to save your card and enable auto-renew. You're always free to turn this off from your dashboard and pay manually instead, using any method you prefer.",
      },
      {
        q: "How do I get paid for bookings?",
        a: "BookBeautiq never collects or holds your deposit payments. Every deposit goes straight from Paystack to your own linked bank or M-Pesa account the moment a customer pays — there's no settlement delay on our end. On a customer's first-ever booking with your business, BookBeautiq takes a one-time commission (20%, minimum KES 100) for the new-customer discovery, similar to how other booking marketplaces work. Every booking after that from the same customer is commission-free — you keep 100% of the deposit. Add your payout details from the Payouts section of your dashboard to get started; you must link this before your listing can go live.",
      },

      {
        q: "How is my business ranked on Explore and the homepage?",
        a: "Ranking is based purely on quality signals — average rating, completed bookings, recent activity, and profile completeness — never on which subscription plan you're on. New businesses also get a temporary visibility boost in their first few weeks so they're not buried before they have reviews.",
      },
    ],
    "Account & Trust": [
      {
        q: "Why do business accounts need identity verification?",
        a: "To keep BookBeautiq trustworthy for customers, every business owner must verify their identity and provide business registration details before their listing goes live. This review is done by our team, usually within 1–2 business days.",
      },
      {
        q: "How do I reset my password?",
        a: "Go to the Sign In page and select \"Forgot password?\" You'll receive a reset link at the email address you registered with.",
      },
      {
        q: "How do notifications work?",
        a: "You'll receive both an email and an in-app notification for key events — booking confirmations, new messages, payment confirmations, review reminders, and more — sent to the email you registered with.",
      },
      {
        q: "I think a listing looks suspicious. What do I do?",
        a: "Please contact us through the Contact page with the business name and details. All businesses go through identity verification, but we take reports seriously and will investigate.",
      },
    ],
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAFAF9]">

        {/* HERO */}
        <section className="border-b border-[#ECE9E6] bg-gradient-to-br from-[#FFF9FB] via-[#F8EEF2] to-[#FAFAF9] px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
              Help Center
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#242424] sm:text-5xl">
              How can we help?
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-600">
              Answers to common questions about booking, payments, and running your business on BookBeautiq.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-6">

          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">

            {/* CATEGORY NAV */}
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenIndex(null);
                  }}
                  className={`whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeCategory === cat
                      ? "bg-[#242424] text-white"
                      : "bg-white text-gray-600 shadow-sm hover:text-[#B96882]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ LIST */}
            <div className="space-y-3">
              {faqs[activeCategory].map((item, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-[#E5E2DF] bg-white"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-[#242424]">{item.q}</span>
                    <span className={`shrink-0 text-lg text-[#B96882] transition-transform ${openIndex === i ? "rotate-45" : ""}`}>
                      +
                    </span>
                  </button>

                  {openIndex === i && (
                    <div className="border-t border-[#ECE9E6] px-6 py-5 text-sm leading-6 text-gray-600">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* CONTACT CTA */}
          <div className="mt-14 rounded-[28px] border border-[#E5E2DF] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-[#242424]">Still need help?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Can't find what you're looking for? Reach out and our team will get back to you.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-block rounded-xl bg-[#242424] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B96882]"
            >
              Contact Us
            </Link>
          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default HelpCenter;
