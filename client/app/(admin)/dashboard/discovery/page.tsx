"use client";

import { getAllBooks } from "@/fetchs/services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Search } from "lucide-react";

export default function DiscoveryboardPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const {
    data: books,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["all-books", search],
    queryFn: () => getAllBooks(search),
  });

  const disarray = [
    "Thriller",
    "Horror",
    "Psychological Drama",
    "Romance",
    "Short Stories",
    "Urban Fiction",
    "Mystery",
    "Inspirational",
  ];

  if (isLoading) {
    return <div className="flex justify-center py-20">Loading books...</div>;
  }

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-8">Discover Books</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {disarray.map((item) => (
          <button
            key={item}
            onClick={() => {
              setSelectedCategory(item);
              setSearch(item);
            }}
            className={`px-5 py-3 rounded-xl font-medium transition-all border
              ${
                selectedCategory === item
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }
            `}>
            {item}
          </button>
        ))}
      </div>

      <ul className="flex items-center gap-6 text-gray-700 dark:text-gray-200">
        <li className="relative flex items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              placeholder="Search books..."
              className="
          pl-9 pr-3 py-1.5 rounded-md
          border border-gray-300 dark:border-neutral-800
          bg-white dark:bg-[#111214] dark:text-gray-200
          focus:outline-none
          w-48 sm:w-48 md:w-64
        "
            />
          </div>

          <button
            onClick={() => {
              setSearch(searchInput);
              setSelectedCategory("");
            }}
            className="
        px-4 py-1.5 rounded-md
        bg-black text-white
        hover:bg-gray-800
        transition
      ">
            Search
          </button>
        </li>
      </ul>

      {isError || !books?.length ? (
        <div className="flex justify-center py-20 text-gray-500">
          No books found for "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {books.map((book: any) => (
            <div
              key={book.id}
              onClick={() => router.push(`/dashboard/${book.id}`)}
              className="relative h-72 rounded-lg overflow-hidden shadow-lg cursor-pointer group">
              <Image
                src={book.coverphoto}
                alt={book.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h2 className="font-semibold text-sm line-clamp-2">
                  {book.title}
                </h2>

                <p className="text-xs text-gray-200 mt-1">{book.author}</p>

                <div className="flex justify-between text-[11px] text-gray-300 mt-2">
                  <span>{book.category}</span>
                  <span>{book.pageCount} pages</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* </div> */}
    </div>
  );
}
