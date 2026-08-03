"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react"; // optional icon
import { Link, Element } from "react-scroll";
function FQA() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is ReadNest?",
      answer:
        "ReadNest is an online platform that allows users to explore, read, and discover a wide range of books across different genres.",
    },
    {
      question: "Do I need an account to use ReadNest?",
      answer:
        "Yes, you need to create an account to access personalized recommendations and save your favorite books.",
    },
    {
      question: "Is ReadNest free to use?",
      answer:
        "ReadNest offers  free books. Free users can read selected books, while premium users enjoy unlimited access.",
    },
    {
      question: "Can I download books to read offline?",
      answer: "NO offline for now,only on web",
    },
    {
      question: "Can I publish my own books on ReadNest?",
      answer:
        "Yes! Authors can sign up as publishers and upload their works directly to the ReadNest platform.",
    },
  ];

  const toggleFAQ = (index: any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Element
      name="FAQ"
      className="bg-[#000000] text-white  py-36 px-6 md:px-20  -mt-16">
      <h2 className="text-3xl font-bold tracking-tight mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-4 cursor-pointer transition-all duration-200"
            onClick={() => toggleFAQ(index)}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </div>
            {openIndex === index && (
              <p className="text-white mt-3">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </Element>
  );
}

export default FQA;
