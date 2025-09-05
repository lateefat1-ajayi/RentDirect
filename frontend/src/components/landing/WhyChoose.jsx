export default function WhyChoose() {
  return (
    <section className="py-16 px-6 md:px-12 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Why Choose RentDirect?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          We’re revolutionizing the rental market in Nigeria by connecting you directly with property owners.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Direct Connection
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Connect directly with property owners. No middlemen, no extra fees, just honest transactions.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Verified Properties
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              All properties are verified and vetted. We ensure quality and authenticity for your peace of mind.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Transparent Pricing
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Clear, upfront pricing with transparent platform fees. We charge only 5% on successful transactions to maintain our service.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
