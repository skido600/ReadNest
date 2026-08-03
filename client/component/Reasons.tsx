import React from "react";
import { Book, Users, Star, Globe } from "lucide-react";

const reasons = [
  {
    id: 1,
    icon: <Book className="w-8 h-8 text-[#e60914]" />,
    title: "Vast Library Collection",
    desc: "Access thousands of trending and classic books across every genre.",
  },
  {
    id: 2,
    icon: <Users className="w-8 h-8 text-[#e60914]" />,
    title: "Community of Readers",
    desc: "Join passionate readers, share reviews, and connect over your favorite stories.",
  },
  {
    id: 3,
    icon: <Star className="w-8 h-8 text-[#e60914]" />,
    title: "Personalized Recommendations",
    desc: "Get book suggestions tailored to your reading taste and interests.",
  },
  {
    id: 4,
    icon: <Globe className="w-8 h-8 text-[#e60914]" />,
    title: "Read Anywhere, Anytime",
    desc: "Enjoy seamless access to your library across all your devices.",
  },
];

function Reasons() {
  return (
    <section className="bg-[#000000] text-white  py-36 px-6 md:px-20  -mt-12">
      <div className=" mb-12">
        <h2 className="text-3xl tracking-tight font-bold ">
          More Reasons to Join ReadNest?
        </h2>
        {/* <p className="text-gray-400 mt-2">
          Discover the benefits of being part of the ultimate book community.
        </p> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {reasons.map((reason) => (
          <div
            key={reason.id}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-red-600 to-transparent blur-md"></div>
            <div className="flex justify-center mb-4">{reason.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{reason.title}</h3>
            <p className="text-gray-400 text-sm">{reason.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Reasons;
