import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../ui/Button";

export default function CallToAction() {
  return (
    <section className="bg-primary dark:bg-yellow-400 text-white dark:text-gray-900 py-16 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center space-y-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Prevent Property Damage the Smart Way?
        </h2>
        <p className="text-lg">
          Join RentDirect today and experience seamless property renting and communication.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/register">
            <Button variant="light">Get Started</Button>
          </Link>
          <Link to="/faq">
            <Button variant="outline" className="border-white text-white dark:border-gray-900 dark:text-gray-900 hover:bg-white dark:hover:bg-gray-900 hover:text-primary dark:hover:text-yellow-400">
              Learn More
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
