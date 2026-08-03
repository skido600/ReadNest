"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Back from "./Back";

const helpSections = [
  {
    title: "Account & Membership",
    items: [
      {
        name: "How to create a ReadNest account",
        description:
          "To create an account, go to ReadNest.com, click 'Sign Up', and follow the instructions to enter your email, password, and other details.",
      },
      {
        name: "Updating your payment methods",
        description:
          "Go to your Account page and select 'Payment Methods' to update or add a new payment method.",
      },
      {
        name: "Canceling or pausing your membership",
        description:
          "You can cancel or pause your membership from the Account page. Access will continue until the end of the billing period.",
      },
      {
        name: "Managing multiple profiles",
        description:
          "From your Account settings, you can add, edit, or remove profiles to personalize recommendations for each user.",
      },
    ],
  },
  {
    title: "Streaming & Devices",
    items: [
      {
        name: "Supported devices for ReadNest",
        description:
          "ReadNest can be accessed on smart TVs, mobile devices, tablets, computers, and streaming devices.",
      },
      {
        name: "How to stream on multiple devices",
        description:
          "Your subscription allows simultaneous streams depending on your plan. Sign in on each device using your account.",
      },
      {
        name: "Troubleshooting playback issues",
        description:
          "Try restarting the device, checking your internet connection, or reinstalling the app. If issues persist, contact support.",
      },
      {
        name: "Offline downloads and restrictions",
        description:
          "Some content is available for offline viewing. Downloads have limits on the number of titles and devices.",
      },
    ],
  },
  {
    title: "Content & Recommendations",
    items: [
      {
        name: "Personalized content recommendations",
        description:
          "ReadNest analyzes your viewing history to recommend movies and shows tailored to your tastes.",
      },
      {
        name: "How ratings and reviews work",
        description:
          "You can rate content to influence your recommendations. Reviews help others discover content but are optional.",
      },
      {
        name: "Parental controls and content restrictions",
        description:
          "Set up PINs, age filters, and profile restrictions to control what content children can access.",
      },
    ],
  },
  {
    title: "Billing & Payments",
    items: [
      {
        name: "Subscription plans and pricing",
        description:
          "View your available plans and pricing on the Account page. Choose a plan that fits your needs and budget.",
      },
      {
        name: "Handling failed payments",
        description:
          "If a payment fails, you will be notified. Update your Payment Method to continue access without interruption.",
      },
      {
        name: "Refunds and billing disputes",
        description:
          "Refunds are generally not provided for partial billing periods, but you can contact support for billing disputes.",
      },
    ],
  },
];

function Help() {
  const [openItem, setOpenItem] = useState<Record<string, boolean>>({});

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setOpenItem((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="min-h-screen bg-gray-50  pt-34 py-20 px-4 md:px-20  flex justify-center items-start">
      <div className="max-w-4xl w-full">
        <Back />
        <h1 className="text-4xl font-bold mb-6 ">Help Center</h1>
        <p className="mb-8 text-gray-700 ">
          Welcome to the ReadNest Help Center. Click on a topic to see more
          details.
        </p>

        {helpSections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-8">
            <h2 className=" text-2xl font-semibold mb-4 text-left md:text-center">
              {section.title}
            </h2>
            <ul className="text-gray-700">
              {section.items.map((item, itemIndex) => {
                const key = `${sectionIndex}-${itemIndex}`;
                return (
                  <li key={key} className="mb-2">
                    <button
                      onClick={() => toggleItem(sectionIndex, itemIndex)}
                      className="w-full text-left font-medium text-gray-800 hover:text-blue-600 flex justify-between items-center px-2 py-1">
                      {item.name}
                      {openItem[key] ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                    {openItem[key] && (
                      <p className="mt-1  text-xs text-gray-600 px-4">
                        {item.description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className="text-gray-500 text-sm mt-12 text-center">
          Still need help? Contact us at{" "}
          <a
            href="mailto:support@ReadNest.com"
            className="text-blue-600 underline">
            ebisileonard@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}

export default Help;
