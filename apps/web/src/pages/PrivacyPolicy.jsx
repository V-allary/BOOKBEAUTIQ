import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "Account information: your name, email address, phone number, and password (stored securely as a hash, never in plain text) when you register as a customer or business owner.",
        "Business verification information: for business accounts, we collect identity documents, legal business name, registration number, business address, and country of registration to verify your identity before your listing goes live.",
        "Booking information: service, date, time, and any contact details you provide when booking, whether as a registered user or a guest.",
        "Payment information: deposit payments are processed directly through Paystack, our payment processor. BookBeautiq does not store your card number, CVV, or full payment details — only a masked reference (such as the card brand and last 4 digits) needed to identify a saved payment method, if you choose to enable auto-renew for a business subscription.",
        "Communications: messages sent between customers and businesses through our in-app chat, and any messages you send us directly.",
        "Usage information: profile views and saved businesses are tracked to power features like business analytics and your saved list.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "To create and manage your account, process bookings, and facilitate payments between customers and businesses.",
        "To verify business owners' identities and business legitimacy before allowing them to list services publicly.",
        "To send you booking confirmations, appointment reminders, payment confirmations, review requests, and other service-related notifications by email and in-app notification.",
        "To rank businesses fairly on our Explore and Home pages, based on quality signals such as rating, completed bookings, and profile completeness — never based on payment or subscription tier.",
        "To detect and prevent fraud, abuse, or violations of our terms.",
      ],
    },
    {
      title: "3. How We Share Your Information",
      content: [
        "With the business you book with, we share the contact details necessary to fulfill your appointment (name, email, phone number).",
        "With Paystack, our payment processor, to process deposit payments and subscription payments securely.",
        "We do not sell your personal information to third parties.",
        "We may disclose information if required by law or to protect the safety and rights of our users.",
      ],
    },
    {
      title: "4. Data Retention",
      content: [
        "We retain your account and booking information for as long as your account is active, and as needed to comply with legal obligations, resolve disputes, and enforce our agreements.",
        "You may request deletion of your account and associated personal data by contacting us, subject to any records we're legally required to retain.",
      ],
    },
    {
      title: "5. Your Choices",
      content: [
        "You can update your account information at any time from your dashboard.",
        "Business owners can turn off auto-renew and remove a saved payment method at any time from their subscription settings.",
        "You can unsave a business at any time; saved businesses are only used to power your own saved list and are not shared publicly.",
      ],
    },
    {
      title: "6. Security",
      content: [
        "Passwords are stored using industry-standard hashing (bcrypt) and are never visible to our team.",
        "Sensitive requests are protected with authentication and role-based access controls, so only account owners and authorized administrators can access relevant data.",
        "While we take reasonable steps to protect your information, no online platform can guarantee absolute security.",
      ],
    },
    {
      title: "7. Contact Us",
      content: [
        "If you have questions about this policy or how your information is handled, please reach out through our Contact page.",
      ],
    },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FAFAF9]">

        {/* HERO */}
        <section className="border-b border-[#ECE9E6] bg-gradient-to-br from-[#FFF9FB] via-[#F8EEF2] to-[#FAFAF9] px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#B96882]">
              Legal
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#242424] sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-gray-500">
              Last updated: September 2026
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-6">

          <div className="rounded-[28px] border border-[#E5E2DF] bg-white p-8 shadow-sm sm:p-10">

            <p className="mb-8 text-sm leading-7 text-gray-600">
              BookBeautiq ("we," "our," or "us") respects your privacy. This policy explains what information we collect, how we use it, and the choices you have, specific to how BookBeautiq actually works as a beauty booking marketplace.
            </p>

            <div className="space-y-10">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="mb-3 text-lg font-bold text-[#242424]">{section.title}</h2>
                  <ul className="space-y-2.5">
                    {section.content.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-6 text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B96882]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default PrivacyPolicy;
