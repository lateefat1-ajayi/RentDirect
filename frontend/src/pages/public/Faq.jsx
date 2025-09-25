import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaSearch, FaLightbulb } from "react-icons/fa";

const faqs = [
  {
    question: "What is RentDirect and how does it work?",
    answer:
      "RentDirect is Nigeria's leading digital rental platform that connects tenants and landlords directly. We eliminate middlemen by providing a secure platform where landlords can list properties, tenants can apply directly, and both parties can communicate and manage their rental relationship through our integrated tools. Our platform includes features like direct messaging, application management, secure payments, and review systems.",
  },
  {
    question: "What are the fees for using RentDirect?",
    answer:
      "RentDirect charges a transparent 5% platform fee only on successful rent transactions. This means: • Tenants pay the full rent amount (no additional fees) • Landlords receive 95% of the rent payment • The 5% fee helps us maintain the platform, provide customer support, and ensure secure payments • No fees for listing properties, messaging, or other platform features",
  },
  {
    question: "How do I find and apply for properties?",
    answer:
      "Browse available properties on our homepage or use the search filters to find properties by location, price, and amenities. When you find a property you like: 1. Click 'Apply Now' to submit your application 2. Fill out the application form with your details 3. Upload required documents (ID, employment letter, etc.) 4. Wait for the landlord to review and respond 5. If approved, you'll receive a lease agreement to sign",
  },
  {
    question: "How do I list my property as a landlord?",
    answer:
      "To list your property: 1. Create a landlord account and complete verification 2. Submit required documents (property ownership, ID, bank details) 3. Wait for admin approval (usually 1-3 business days) 4. Once verified, go to 'Listings' and click 'Add Property' 5. Upload photos, set rent amount, and add property details 6. Your property will be reviewed and published within 24 hours",
  },
  {
    question: "How do I make rent payments?",
    answer:
      "RentDirect uses Paystack for secure payments: 1. Go to your 'Payments' section in your dashboard 2. Select the property you want to pay for 3. Click 'Make Payment' to open the payment modal 4. Review the payment breakdown (including platform fee) 5. Enter your email and click 'Pay' 6. Complete payment using your preferred method (card, bank transfer, etc.) 7. You'll receive a confirmation email and notification",
  },
  {
    question: "How do I communicate with my landlord/tenant?",
    answer:
      "Use our built-in messaging system: 1. Go to 'Messages' in your dashboard 2. Select the conversation with your landlord/tenant 3. Send messages, photos, or documents 4. All conversations are saved and can be referenced later 5. You'll receive real-time notifications for new messages 6. Messages are grouped to avoid notification spam",
  },
  {
    question: "What documents do I need for verification?",
    answer:
      "For tenants: Valid ID (National ID, Driver's License, or International Passport), employment letter or proof of income, and bank statement. For landlords: Business registration documents, property ownership documents, valid ID, utility bill, bank statement, and property documents (C of O, survey plan, etc.). All documents are securely stored and only used for verification purposes.",
  },
  {
    question: "How do I report issues or problems?",
    answer:
      "You can report issues in several ways: 1. Use the messaging system to contact your landlord/tenant directly 2. Go to 'Contact Us' page for general platform issues 3. Use the 'Report' feature in your dashboard for serious concerns 4. Email our support team for urgent matters 5. All reports are reviewed by our admin team within 24 hours",
  },
  {
    question: "Can I leave reviews for my landlord/tenant?",
    answer:
      "Yes! After completing a lease period, both parties can leave reviews: 1. Go to 'Reviews' in your dashboard 2. Select the person you want to review 3. Rate them on various criteria (communication, property condition, etc.) 4. Write a detailed review about your experience 5. Reviews help build trust and help others make informed decisions",
  },
  {
    question: "What if I have a dispute with my landlord/tenant?",
    answer:
      "RentDirect provides several dispute resolution options: 1. First, try to resolve through direct messaging 2. Use our mediation service where our team helps facilitate discussions 3. For serious disputes, we can provide documentation of all communications 4. In extreme cases, we recommend seeking legal advice 5. Our support team is always available to guide you through the process",
  },
  {
    question: "How do I update my profile or account settings?",
    answer:
      "To update your profile: 1. Go to 'Profile' in your dashboard 2. Click 'Edit Profile' to update personal information 3. Upload or change your profile picture 4. Update contact information, preferences, and settings 5. For landlords, you can also update business information and bank details 6. All changes are saved automatically",
  },
  {
    question: "Is my personal information secure on RentDirect?",
    answer:
      "Absolutely! We take security seriously: • All data is encrypted and stored securely • We use industry-standard security protocols • Your financial information is handled by Paystack (PCI DSS compliant) • We never share your personal information with third parties • You can delete your account and data at any time • Our platform is regularly audited for security compliance",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
            <FaQuestionCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="text-base text-white/90 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about RentDirect and how our platform works
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {searchTerm && (
            <div className="mb-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchTerm}"
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left px-6 py-5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <FaChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <FaChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 py-5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <FaLightbulb className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                      <div className="whitespace-pre-line">{faq.answer}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <FaQuestionCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try searching with different keywords or browse all questions below
              </p>
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-gray-800 dark:bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
