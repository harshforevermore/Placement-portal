import Navbar from '../components/common/Navbar';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import Footer from '../components/common/Footer';

const HomePage = () => {
  return (
    <div className="home-page-contaienr min-h-screen bg-slate-900">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <Footer />
    </div>
  )
};

export default HomePage;