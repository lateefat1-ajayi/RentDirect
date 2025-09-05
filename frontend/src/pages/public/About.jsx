import { FaHome, FaUsers, FaShieldAlt, FaHandshake, FaChartLine, FaHeart, FaAward, FaGlobe } from "react-icons/fa";

export default function About() {
  const stats = [
    { icon: <FaHome className="w-8 h-8" />, number: "10,000+", label: "Properties Listed" },
    { icon: <FaUsers className="w-8 h-8" />, number: "25,000+", label: "Happy Users" },
    { icon: <FaHandshake className="w-8 h-8" />, number: "15,000+", label: "Successful Rentals" },
    { icon: <FaShieldAlt className="w-8 h-8" />, number: "99.9%", label: "Secure Transactions" }
  ];

  const values = [
    {
      icon: <FaShieldAlt className="w-12 h-12 text-blue-600" />,
      title: "Security First",
      description: "We prioritize the safety and security of all transactions and user data with industry-standard encryption and verification processes."
    },
    {
      icon: <FaHandshake className="w-12 h-12 text-green-600" />,
      title: "Trust & Transparency",
      description: "Complete transparency in all dealings, from platform fees to property details, ensuring honest and fair interactions."
    },
    {
      icon: <FaUsers className="w-12 h-12 text-purple-600" />,
      title: "User-Centric",
      description: "Every feature is designed with our users in mind, providing intuitive tools that make property management effortless."
    },
    {
      icon: <FaHeart className="w-12 h-12 text-red-600" />,
      title: "Community Focused",
      description: "Building a community where landlords and tenants can connect, communicate, and create lasting rental relationships."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">About RentDirect</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing the rental market in Nigeria through technology, transparency, and trust
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                RentDirect is a digital platform built to simplify the rental process in Nigeria.
                We help bridge the gap between tenants and landlords by fostering transparency, 
                trust, and accountability through seamless communication tools and preventive systems.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Whether you're a tenant looking for reliable housing or a landlord wanting responsible 
                occupants, RentDirect is your trusted partner. Our tools help prevent property damage, 
                ensure smooth transactions, and provide peace of mind.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <FaGlobe className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Our Vision</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                To become Nigeria's leading rental platform, transforming property management 
                into a safer, more efficient, and user-centered experience for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do at RentDirect
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Fees Section */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <FaChartLine className="w-8 h-8 text-gray-600 dark:text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Transparent Platform Fees
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-gray-600 dark:text-gray-300 mb-2">5%</div>
                <div className="text-gray-700 dark:text-gray-300">Platform Fee</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-700 dark:text-gray-300">Landlord Receives</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-gray-600 dark:text-gray-300 mb-2">0%</div>
                <div className="text-gray-700 dark:text-gray-300">Additional Fees</div>
              </div>
            </div>
            <p className="text-center text-gray-700 dark:text-gray-300 text-lg">
              We believe in complete transparency. RentDirect charges a small 5% platform fee only on successful rent transactions. 
              This fee helps us maintain our platform, provide customer support, and ensure secure payments for all users.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-6">
            <FaAward className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Built by Nigerians, for Nigerians</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Our team understands the unique challenges of the Nigerian rental market. We're committed to 
            creating solutions that work for our local context while maintaining international standards 
            of security and user experience.
          </p>
        </div>
      </section>
    </div>
  );
}
