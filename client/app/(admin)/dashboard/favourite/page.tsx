"use client";
import { bookHistory } from "@/fetchs/services";
import { useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function FavouriteboardPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const {
    data: history,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["book-history", search],
    queryFn: () => bookHistory(search),
  });
  const router = useRouter();

  if (isLoading) {
    return <div className="flex justify-center py-20">Loading...</div>;
  }

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">Reading History</h1>
      <ul className="flex items-center gap-6 mb-4 text-gray-700 dark:text-gray-200">
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
      {isError || !history?.length ? (
        <div className="flex justify-center py-20 text-gray-500">
          No books found for "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {history.map((book: any) => (
            <div
              onClick={() => router.push(`/dashboard/${book.bookId}`)}
              key={book.historyId}
              className="relative min-w-[150px] h-72 rounded-lg overflow-hidden shadow-lg cursor-pointer">
              <Image
                src={book.coverphoto}
                alt={book.title}
                fill
                className="object-cover"
              />

              <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white p-2">
                <h2 className="text-sm font-bold">{book.title}</h2>

                <p className="text-xs">{book.author}</p>

                <div className="flex justify-between mt-3 text-xs">
                  <span>{book.category}</span>
                  <span>{book.pageCount} pages</span>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Read on {new Date(book.readAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* </div> */}
    </div>
  );
}
