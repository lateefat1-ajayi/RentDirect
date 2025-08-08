import { motion } from "framer-motion";
import { FaUserCheck, FaSearchLocation, FaHandshake } from "react-icons/fa";

const steps = [
  {
    icon: <FaUserCheck className="text-primary dark:text-yellow-400 w-6 h-6" />,
    title: "Sign Up",
    description: "Create an account as a tenant or landlord in just a few steps.",
  },
  {
    icon: <FaSearchLocation className="text-primary dark:text-yellow-400 w-6 h-6" />,
    title: "Find or List Property",
    description:
      "Landlords can list properties. Tenants can browse listings directly—no agents needed.",
  },
  {
    icon: <FaHandshake className="text-primary dark:text-yellow-400 w-6 h-6" />,
    title: "Connect & Rent",
    description:
      "Communicate directly, sign rental agreements, and enjoy a safe renting experience.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-6 md:px-12 bg-background dark:bg-gray-950 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-12">
          How RentDirect Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow hover:-translate-y-1 transition-transform"
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
