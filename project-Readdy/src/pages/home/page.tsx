import Header from '../../components/feature/Header';
import HeroSection from './components/HeroSection';
import ProductCardsSection from './components/ProductCardsSection';
import CategorySection from './components/CategorySection';
import RecommendedSection from './components/RecommendedSection';
import NewArrivalsSection from './components/NewArrivalsSection';
import FeaturedSection from './components/FeaturedSection';
import ReviewsSummarySection from './components/ReviewsSummarySection';
import Footer from '../../components/feature/Footer';
import BackToTop from '../../components/feature/BackToTop';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ProductCardsSection />
      <CategorySection />
      <RecommendedSection />
      <NewArrivalsSection />
      <FeaturedSection />
      <ReviewsSummarySection />
      <Footer />
      <BackToTop />
    </div>
  );
};

export default HomePage;
