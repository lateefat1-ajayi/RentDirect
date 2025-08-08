import { motion } from "framer-motion";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Aisha Bello",
      role: "Tenant in Lagos",
      quote:
        "RentDirect helped me find my dream apartment in less than a week. No agents, no stress!",
    },
    {
      name: "Mr. Adekunle",
      role: "Landlord in Abuja",
      quote:
        "Listing my property was easy, and I had quality tenants reach out almost immediately.",
    },
    {
      name: "Chuka Eze",
      role: "Tenant in Enugu",
      quote:
        "The direct communication made everything smooth. I highly recommend RentDirect.",
    },
  ];

  return (
    <section className="py-16 px-6 md:px-12 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-10">
          What People Are Saying
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">“{t.quote}”</p>
              <div className="text-sm text-primary dark:text-yellow-400 font-semibold">
                {t.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
