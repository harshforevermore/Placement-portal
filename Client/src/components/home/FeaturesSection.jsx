const FeaturesSection = () => {
  const features = [
    {
      title: "For Students",
      description: "Create comprehensive profiles, get instant notifications, and track your applications seamlessly.",
      icon: "👨‍🎓",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "For Institutions",
      description: "Manage placements efficiently, verify students, and access detailed analytics and reports.",
      icon: "🏛️",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "For Companies",
      description: "Connect with quality talent, streamline recruitment, and build lasting partnerships.",
      icon: "🏢",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="bg-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Built for Everyone
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Our platform serves students, institutions, and companies with tailored features for each
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <div className="text-5xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              <div className={`w-full h-1 bg-gradient-to-r ${feature.color} rounded-full mt-6 opacity-75`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;