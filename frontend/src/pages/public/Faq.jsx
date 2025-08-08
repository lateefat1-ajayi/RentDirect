import { useState } from "react";

const faqs = [
  {
    question: "What is RentDirect?",
    answer:
      "RentDirect is a platform that connects tenants and landlords directly, helping prevent property damage and ensuring accountability.",
  },
  {
    question: "Is RentDirect free to use?",
    answer:
      "Yes! RentDirect is free for tenants. Landlords may have optional premium features in the future.",
  },
  {
    question: "How do I report property issues?",
    answer:
      "After signing in, go to your dashboard and use the messaging system to notify your landlord or submit a report.",
  },
  {
    question: "Can landlords verify tenant history?",
    answer:
      "Yes, we provide tools for reviewing tenant application details, communication history, and rental behavior.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="min-h-screen bg-white dark:bg-gray-900 py-16 px-6 md:px-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold"
              >
                {faq.question}
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
