import { motion } from "framer-motion";
import HeroImage from "../../assets/HeroImage.jpg";
import Button from "../ui/Button";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <>
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-16 gap-12 bg-white dark:bg-gray-900">
        {/* Left text */}
        <div className="text-center md:text-left md:w-1/2 space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Find Safe Rentals, Prevent Property Damage
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
            Our platform connects tenants and landlords with tools to prevent property damage and ensure accountability.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
           <Link to="/auth/register">
            <Button variant="outline" size="md">Get Started</Button>
          </Link>
           <Link to="/about">
            <Button variant="primary" size="md">Learn more</Button>
          </Link>
          </div>
        </div>

        {/* Right image */}
        <div className="md:w-1/2 flex justify-center">
          <motion.img
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              y: [0, -10, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              },
              scale: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            src={HeroImage}
            alt="Hero"
            className="max-w-[400px] md:max-w-[500px] rounded-lg w-full object-contain"
          />
        </div>
      </section>

      {/* SVG Divider */}
      <div className="overflow-hidden -mt-10">
        <svg className="w-full h-16 text-white dark:text-gray-900" viewBox="0 0 1440 320">
          <path fill="currentColor" d="M0,64L1440,160L1440,0L0,0Z" />
        </svg>
      </div>
    </>
  );
}
