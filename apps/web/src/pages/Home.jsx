import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import FeaturedProfessionals from "../components/FeaturedProfessionals";
import WhyChooseUs from "../components/WhyChooseUs";
import Hero from "../components/Hero";
import Testimonials from "../components/Testimonials";
import DownloadApp from "../components/DownloadApp";
import PopularCities from "../components/PopularCities";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Helmet>
        <title>BookBeautiq — Book Trusted Beauty & Wellness Professionals in Africa</title>
        <meta
          name="description"
          content="Discover and book verified salons, barbers, nail artists, spas and beauty professionals near you. Secure deposits, real reviews, instant booking — all in one place."
        />
      </Helmet>

      <Navbar />
      <Hero />
      <FeaturedProfessionals/>
      <WhyChooseUs/>
      <Testimonials/>
      <DownloadApp/>
      <PopularCities/>
      <Footer/>
    </>
  );
}

export default Home;