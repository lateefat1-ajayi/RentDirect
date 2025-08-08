export default function StatsStrip() {
  const stats = [
    { label: "Verified Listings", value: "10,000+" },
    { label: "Happy Tenants", value: "7,500+" },
    { label: "Landlords Registered", value: "1,200+" },
    { label: "Cities Covered", value: "30+" },
  ];

  return (
    <section className="bg-primary text-white dark:bg-yellow-400 dark:text-black py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index}>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
