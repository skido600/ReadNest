"use client";

import { getFeaturedBook } from "@/fetchs/services";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
function Cover_components() {
  const {
    data: books = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featured-book"],
    queryFn: getFeaturedBook,
  });
  const router = useRouter();
  if (isLoading) {
    return (
      <main className="px-2">
        <h1 className="text-2xl font-Tagesschrift dark:text-white mb-4">
          Top Read Book
        </h1>
        <div className="h-96 rounded-lg bg-gray-200 animate-pulse" />
      </main>
    );
  }

  if (isError || books.length === 0) {
    return null;
  }

  // Get the latest featured book
  const book = books[0];

  return (
    <main className="px-2">
      <h1 className="text-2xl font-Tagesschrift dark:text-white mb-4">
        Top Read Book
      </h1>

      <div className="flex justify-center">
        <div
          onClick={() => router.push(`/dashboard/${book.id}`)}
          className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={book.coverphoto}
            alt={book.title}
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-2xl font-bold">{book.title}</h2>

            <p className="text-sm mt-1">By {book.author}</p>

            <p className="text-sm mt-2 line-clamp-3 text-gray-200">
              {book.description}
            </p>

            <div className="flex gap-4 mt-3 text-xs text-gray-300">
              <span>{book.category}</span>
              <span>{book.pageCount} Pages</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Cover_components;
