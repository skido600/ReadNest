"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteBookService,
  editBookService,
  getAllBooks,
} from "@/fetchs/services";
import toast from "react-hot-toast";
import { Pencil, Trash2, Search, X } from "lucide-react";
import Image from "next/image";

export default function AdminboardPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const {
    data: books,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["all-books", search],
    queryFn: () => getAllBooks(search),
  });
  console.log("all book from admin side", books);
  const deleteMutation = useMutation({
    mutationFn: deleteBookService,

    onSuccess: (data: any) => {
      toast.success(data.message);

      queryClient.invalidateQueries({
        queryKey: ["all-books"],
      });
    },

    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, values }: any) => editBookService(id, values),

    onSuccess: (data: any) => {
      toast.success(data.message);

      setOpen(false);
      setEditingBook(null);

      setTitle("");
      setAuthor("");
      setCategory("");
      setDescription("");
      setIsFeatured(false);

      queryClient.invalidateQueries({
        queryKey: ["all-books"],
      });
    },

    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const handleSave = () => {
    if (!editingBook) return;

    editMutation.mutate({
      id: editingBook.id,
      values: {
        title,
        author,
        category,
        description,
        isFeatured,
      },
    });
  };

  return (
    <main className="">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold">Book Management</h1>

        <div className="relative flex items-center gap-2">
          <Search className="absolute left-3 top-3" size={18} />

          <input
            value={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(searchInput);
              }
            }}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books..."
            className="w-30 rounded-lg border py-2 pl-10 pr-4 outline-none"
          />
          <button
            onClick={() => setSearch(searchInput)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Search
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border shadow">
        <table className="min-w-full">
          <thead className="">
            <tr>
              <th className="px-5 py-4 text-left text-xs">Cover</th>

              <th className="px-5 py-4 text-left text-xs">Title</th>

              <th className="px-5 py-4 text-left text-xs">Author</th>

              <th className="px-5 py-4 text-left text-xs">Category</th>

              <th className="px-5 py-4 text-center text-xs">Actions</th>
            </tr>
          </thead>

          <tbody>
            {books?.length ? (
              books.map((book: any) => (
                <tr key={book.id} className="border-t">
                  <td className="px-5 py-4">
                    <Image
                      src={book.coverphoto}
                      alt={book.title}
                      width={32}
                      height={32}
                      unoptimized
                      className="h-20 w-14 rounded object-cover"
                    />
                  </td>

                  <td className="px-5 py-4 text-xs font-medium">
                    {book.title}
                  </td>

                  <td className="px-5 py-4 text-xs">{book.author}</td>

                  <td className="px-5 py-4 text-xs">{book.category}</td>

                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setEditingBook(book);
                          setTitle(book.title);
                          setAuthor(book.author);
                          setCategory(book.category);
                          setDescription(book.description);
                          setIsFeatured(book.isFeatured);
                          setOpen(true);
                        }}
                        className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700">
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Delete this book?")) {
                            deleteMutation.mutate(book.id);
                          }
                        }}
                        className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  {search ? (
                    <>
                      <p className="text-lg font-semibold">No books found</p>
                      <p className="mt-1 text-sm">
                        No results for "<strong>{search}</strong>"
                      </p>
                    </>
                  ) : (
                    <p>No books available.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>{" "}
      {/* Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#121212] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-bold">Edit Book</h2>

              <button
                onClick={() => {
                  setOpen(false);
                  setEditingBook(null);
                }}
                className="rounded-full p-1 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Author</label>

                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                {" "}
                <label className="mb-2 block text-sm font-medium">
                  description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter book description..."
                  rows={5}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none resize-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <input
                  id="featured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />

                <label htmlFor="featured" className="font-medium">
                  Featured Book
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setOpen(false);
                  setEditingBook(null);
                }}
                className="rounded-lg border px-5 py-2 hover:bg-gray-100">
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={editMutation.isPending}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
