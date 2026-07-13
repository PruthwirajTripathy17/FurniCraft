import BestSellers from "../components/BestSellers";
import CTACards from "../components/CTACards";
import DealBanners from "../components/DealBanners";
import FeaturedProducts from "../components/FeaturedProducts";
import FeaturesBar from "../components/FeaturesBar";
import Hero from "../components/Hero";
import HotDeal from "../components/HotDeal";
import PromoBanners from "../components/PromoBanners";
import RecentBlog from "../components/RecentBlog";
import Testimonials from "../components/Testimonials";
import TrendyCollection from "../components/TrendyCollection";

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturesBar />
      <PromoBanners />
      <FeaturedProducts />
      <HotDeal />
      <TrendyCollection />
      <DealBanners />
      <Testimonials />
      <BestSellers />
      <RecentBlog />
      <CTACards />
    </>
  );
};

export default Home;
