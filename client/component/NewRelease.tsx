"use client";
import Image from "next/image";

import { useQuery } from "@tanstack/react-query";
import { getnewbooks } from "@/fetchs/services";

// const newRelease = [
//   {
//     title: "The Midnight Library",
//     author: "Matt Haig",
//     coverimage: "/dummy/surja-sen-das-raj-ViMrMawjj7s-unsplash.jpg",
//   },
//   {
//     title: "Deep Work",
//     author: "Cal Newport",
//     coverimage: "/dummy/thought-catalog-V5BGaJ0VaLU-unsplash.jpg",
//   },
//   {
//     title: "Deep Work 2",
//     author: "Cal Newport",
//     coverimage: "/dummy/thought-catalog-V5BGaJ0VaLU-unsplash.jpg",
//   },
//   {
//     title: "testing mic",
//     author: "Cal Newport",
//     coverimage: "/dummy/thought-catalog-V5BGaJ0VaLU-unsplash.jpg",
//   },
//   {
//     title: "Deep Work",
//     author: "Cal Newport",
//     coverimage: "/dummy/thought-catalog-V5BGaJ0VaLU-unsplash.jpg",
//   },
// ];
function BookSkeleton() {
  return (
    <div className="relative min-w-[150px] h-72 rounded-lg overflow-hidden bg-gray-300 dark:bg-gray-700 animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="h-3 w-3/4 bg-gray-400 dark:bg-gray-600 rounded mb-2"></div>
        <div className="h-2 w-1/2 bg-gray-400 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
}

export default function NewRelease() {
  const { isPending, isLoading, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: getnewbooks,
  });

  const showSkeleton = isPending || isLoading;
  console.log("data from latesdata", data);
  return (
    <section className="mb-8 px-2">
      <h1 className="text-2xl dark:text-white mt-7">New Release</h1>

      <div className="grid_1">
        {showSkeleton
          ? Array.from({ length: 5 }).map((_, i) => <BookSkeleton key={i} />)
          : data?.map((book: any, index: number) => (
              <div
                key={index}
                className="relative min-w-[150px] h-72 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={book.coverphoto}
                  alt={book.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white p-2">
                  <h2 className="text-sm font-bold">{book.title}</h2>
                  <p className="text-xs">{book.author}</p>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
