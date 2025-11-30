import Navbar from '../components/common/Navbar';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const {isAuthenticated, user} = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    isAuthenticated && navigate(`/${user.role}/dashboard`);
  }, [isAuthenticated, user]);
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