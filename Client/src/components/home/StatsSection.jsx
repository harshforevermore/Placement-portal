const StatsSection = () => {
  const stats = [
    { label: "Institutions", value: "150+", icon: "🏢" },
    { label: "Students Placed", value: "25,000+", icon: "🎓" },
    { label: "Partner Companies", value: "500+", icon: "🤝" },
    { label: "Success Rate", value: "92%", icon: "📈" }
  ];

  return (
    <section className="bg-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                {stat.value}
              </div>
              <div className="text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;