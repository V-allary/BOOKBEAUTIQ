import Navbar from "../components/Navbar";
import FeaturedProfessionals from "../components/FeaturedProfessionals";
import WhyChooseUs from "../components/WhyChooseUs";
import Hero from "../components/Hero";
import Testimonials from "../components/Testimonials";
import DownloadApp from "../components/DownloadApp";
import PopularCities from "../components/PopularCities";
import Categories from "../components/Categories";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedProfessionals/>
      <Categories />
      <WhyChooseUs/>
      <Testimonials/>
      <DownloadApp/>
      <PopularCities/>
      <Footer/>
    </>
  );
}

export default Home;