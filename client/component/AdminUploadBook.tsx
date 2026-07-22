"use client";

import { uploadBookService } from "@/fetchs/services";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

// uploadBookService
const categories = [
  "Thriller",
  "Horror",
  "Psychological Drama",
  "Romance",
  "Short Stories",
  "Urban Fiction",
  "Mystery",
  "Inspirational",
];

export default function AdminUploadBook() {
  const [book, setBook] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    isFeatured: false,
  });
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!book || !cover) {
      toast.error("Book & cover required");
      return;
    }

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("isFeatured", String(form.isFeatured));
    formData.append("book", book);
    formData.append("cover", cover);

    uploadMutation.mutate(formData);
  };
  const uploadMutation = useMutation({
    mutationFn: uploadBookService,

    onSuccess: (data) => {
      toast.success(data.message);

      setForm({
        title: "",
        author: "",
        category: "",
        description: "",
        isFeatured: false,
      });

      setBook(null);
      setCover(null);
      setCoverPreview(null);
      setDropdownOpen(false);
    },

    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
    },
  });
  return (
    <div className="">
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-4">
        <h2 className="text-3xl font-bold mb-2">Upload New Book</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Book Title
              </label>
              <input
                type="text"
                required
                placeholder="Enter title"
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Author */}
            <div>
              <label className="block mb-2 text-sm font-medium">Author</label>
              <input
                type="text"
                required
                placeholder="Author name"
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
          </div>

          {/* Category + Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Category</label>

              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-3 text-left">
                {form.category || "Select category"}
              </button>

              {dropdownOpen && (
                <div className="absolute mt-2 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg max-h-56 overflow-y-auto z-20">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, category: cat });
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800">
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">
                Description
              </label>

              <textarea
                required
                rows={6}
                placeholder="Write at least 20 words about the book..."
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isFeatured: e.target.checked,
                    })
                  }
                />
                <span className="font-medium">Featured Book</span>
              </label>
            </div>
          </div>

          {/* Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PDF */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Upload PDF
              </label>

              <input
                type="file"
                accept="application/pdf"
                required
                className="w-full rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 px-4 py-6"
                onChange={(e) => setBook(e.target.files?.[0] || null)}
              />
            </div>

            {/* Cover */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Cover Image
              </label>

              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="preview"
                  className="w-40 h-56 rounded-lg object-cover border mb-4"
                />
              ) : (
                <div className="w-40 h-56 rounded-lg border-2 border-dashed flex items-center justify-center text-gray-400 mb-4">
                  No Image
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                required
                className="w-full rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 px-4 py-6"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setCover(file);
                  setCoverPreview(URL.createObjectURL(file));
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={uploadMutation.isPending}
            className="w-full rounded-xl bg-black dark:bg-black dark:text-white text-white py-4 font-semibold text-lg hover:opacity-90 transition disabled:opacity-50">
            {uploadMutation.isPending ? "Uploading..." : "Upload Book"}
          </button>
        </form>
      </div>
    </div>
  );
}
