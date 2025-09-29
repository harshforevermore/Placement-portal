import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Connect Talent with 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"> Opportunity</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline your institution's placement process with our comprehensive platform. 
            Empower students, simplify recruitment, and build stronger industry connections.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/institution/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Register Your Institution
            </Link>
            <Link 
              to="/find-institution"
              className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:bg-slate-800"
            >
              Find Your Institution
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;