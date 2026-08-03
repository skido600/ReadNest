"use client";

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedBooks } from "@/fetchs/services";

// Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

// Swiper modules
import { EffectCoverflow, Pagination } from "swiper/modules";

export default function Trending() {
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["featured-books"],
    queryFn: getFeaturedBooks,
  });

  if (isLoading) {
    return (
      <section className="bg-[#000000] text-white py-16 px-6 md:px-20 border-t-4 border-pink-600 rounded-t-[60px] -mt-16">
        <h1 className="text-3xl font-bold">Trending Books</h1>
        <p className="mt-4 text-gray-400">Loading...</p>
      </section>
    );
  }

  return (
    <section className="bg-[#000000] text-white py-16 px-6 md:px-20 border-t-4 border-pink-600 rounded-t-[60px] -mt-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Trending Books</h1>

        <p className="text-gray-400 text-sm mt-2">
          Discover the most popular books everyone is reading now
        </p>
      </div>

      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={false}
        slidesPerView={"auto"}
        spaceBetween={30}
        coverflowEffect={{
          rotate: 40,
          stretch: 0,
          depth: 120,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Pagination]}
        className="mySwiper max-w-6xl mx-auto">
        {books.map((book: any) => (
          <SwiperSlide
            key={book.id}
            className="w-[200px]! md:w-[250px]! lg:w-[280px]!">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg">
              <Image
                src={book.coverphoto}
                alt={book.title}
                width={200}
                height={280}
                className="rounded-lg w-full h-60 object-cover"
              />

              <h2 className="text-lg font-semibold mt-3 truncate">
                {book.title}
              </h2>

              <p className="text-gray-400 text-sm">{book.author}</p>

              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-300">Featured</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
