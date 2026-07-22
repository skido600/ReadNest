"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

// import HerosectionWaitlist from "./HerosectionWaitlist";

function Herosectionbg() {
  const arrayofbook = [
    "/dummy/hardcover-book-mockup-display-for-publishing-designs-and-creative-visual-presentation-use-0566.jpg",
    "/dummy/hardcover-book-mockup-display-for-publishing-designs-and-creative-visual-presentation-use-0566.jpg",
    "/dummy/tim-alex-1i-P178kxHQ-unsplash.jpg",
    "/dummy/varad-parulekar-Gls5DB9lk6s-unsplash.jpg",
    "/dummy/thought-catalog-V5BGaJ0VaLU-unsplash.jpg",
    "/dummy/tim-alex-1i-P178kxHQ-unsplash.jpg",
    "/dummy/hardcover-book-mockup-display-for-publishing-designs-and-creative-visual-presentation-use-0566.jpg",
  ];

  // Motion variants for up and down scrolling
  const upMotion: any = {
    animate: {
      y: [0, -300],
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        duration: 60,
      },
    },
  };

  const downMotion: any = {
    animate: {
      y: [-300, 0],
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        duration: 60,
      },
    },
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/*  */}
      <div
        className="absolute inset-0 flex justify-center items-center gap-3 overflow-hidden"
        style={{
          transform: "perspective(1200px) rotateY(-18deg) scale(1.3)",
          transformStyle: "preserve-3d",
        }}>
        {[...Array(6)].map((_, colIndex) => (
          <motion.div
            key={colIndex}
            className="flex flex-col gap-3"
            {...(colIndex % 2 === 0 ? upMotion : downMotion)}>
            {[...Array(2)].map((_, dupIndex) => (
              <React.Fragment key={dupIndex}>
                {arrayofbook.map((src, i) => (
                  <Image
                    key={`${colIndex}-${dupIndex}-${i}`}
                    src={src}
                    alt="book"
                    width={160}
                    height={220}
                    className="object-cover rounded-md shadow-md opacity-80 hover:opacity-100 hover:scale-105 transition-transform duration-500"
                  />
                ))}
              </React.Fragment>
            ))}
          </motion.div>
        ))}
      </div>

      {/* dark overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black via-black/70 to-transparent"></div>

      {/* === HERO CONTENT === */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-2">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
          Discover Stories Beyond Pages
        </h1>
        <p className="text-sm md:text-xl mb-6">A world of books, reimagined.</p>
        <p className="text-sm md:text-xl text-gray-200 mb-6">
          Ready to Read? Enter your email to create or restart your membership.
        </p>

        {/* <HerosectionWaitlist /> */}
      </div>

      {/* bottom fade */}
      <div className="absolute bottom-0 w-full h-40 bg-linear-to-t from-black to-transparent"></div>
    </section>
  );
}

export default Herosectionbg;
