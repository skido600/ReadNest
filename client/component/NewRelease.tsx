"use client";
import Image from "next/image";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getnewbooks, readBookService } from "@/fetchs/services";

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
import { useRouter } from "next/navigation";

export default function NewRelease() {
  const { isPending, isLoading, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: getnewbooks,
  });
  const router = useRouter();
  const showSkeleton = isPending || isLoading;

  return (
    <section className="mb-8 px-2">
      <h1 className="text-2xl font-Tagesschrift dark:text-white my-2">
        New Release
      </h1>

      <div className="grid_1">
        {showSkeleton
          ? Array.from({ length: 5 }).map((_, i) => <BookSkeleton key={i} />)
          : data?.map((book: any, index: number) => (
              <div
                key={index}
                onClick={() => router.push(`/dashboard/${book.id}`)}
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
