import { motion } from "framer-motion";
import { FaHandshake, FaShieldAlt, FaBell, FaUserShield } from "react-icons/fa";

const features = [
  {
    icon: <FaHandshake className="text-primary dark:text-yellow-400" size={28} />,
    title: "Direct Communication",
    desc: "Connect landlords and tenants directly — no agents, no middlemen.",
  },
  {
    icon: <FaShieldAlt className="text-primary dark:text-yellow-400" size={28} />,
    title: "Secure & Accountable",
    desc: "Built-in systems to prevent damage and ensure fair dealings.",
  },
  {
    icon: <FaUserShield className="text-primary dark:text-yellow-400" size={28} />,
    title: "Custom Dashboards",
    desc: "Each user gets personalized tools for better property management.",
  },
  {
    icon: <FaBell className="text-primary dark:text-yellow-400" size={28} />,
    title: "Smart Notifications",
    desc: "Stay updated on every action — messages, approvals, and updates.",
  },
];

export default function Features() {
  return (
    <section className="bg-white dark:bg-gray-900 py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-gray-900 dark:text-white">
          What Makes RentDirect Special
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
