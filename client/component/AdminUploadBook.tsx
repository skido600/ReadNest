"use client";

import { uploadBookService } from "@/fetchs/services";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

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

type FormValues = {
  title: string;
  author: string;
  category: string;
  description: string;
  isFeatured: boolean;
};

export default function AdminUploadBook() {
  const [book, setBook] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      author: "",
      category: "",
      description: "",
      isFeatured: false,
    },
  });

  const category = watch("category");

  const onSubmit = async (data: FormValues) => {
    if (!book) {
      toast.error("Book PDF is required");
      return;
    }

    if (!cover) {
      toast.error("Cover image is required");
      return;
    }

    if (data.description.trim().split(/\s+/).length < 20) {
      toast.error("Description must be at least 20 words");
      return;
    }

    const formData = new FormData();

    formData.append("title", data.title.trim());
    formData.append("author", data.author.trim());
    formData.append("category", data.category);
    formData.append("description", data.description.trim());
    formData.append("isFeatured", String(data.isFeatured));
    formData.append("book", book);
    formData.append("cover", cover);

    try {
      setUploading(true);

      const response = await uploadBookService(formData);

      toast.success(response.message || "Book uploaded successfully");

      reset();
      setBook(null);
      setCover(null);
      setCoverPreview(null);
      setDropdownOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-4">
        <h2 className="text-3xl font-bold mb-2">Upload New Book</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Title + Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Book Title
              </label>

              <input
                type="text"
                placeholder="Enter title"
                {...register("title", {
                  required: "Book title is required",
                  minLength: {
                    value: 2,
                    message: "Title must be at least 2 characters",
                  },
                  maxLength: {
                    value: 150,
                    message: "Title cannot exceed 150 characters",
                  },
                })}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />

              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Author</label>

              <input
                type="text"
                placeholder="Author name"
                {...register("author", {
                  required: "Author name is required",
                  minLength: {
                    value: 2,
                    message: "Author name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 100,
                    message: "Author name cannot exceed 100 characters",
                  },
                })}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />

              {errors.author && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.author.message}
                </p>
              )}
            </div>
          </div>

          {/* Category + Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium">Category</label>

              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-3 text-left">
                {category || "Select category"}
              </button>

              {dropdownOpen && (
                <div className="absolute mt-2 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg max-h-56 overflow-y-auto z-20">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setValue("category", cat, {
                          shouldValidate: true,
                        });
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800">
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="hidden"
                {...register("category", {
                  required: "Please select a category",
                })}
              />

              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Description
              </label>

              <textarea
                rows={6}
                placeholder="Write at least 20 words about the book..."
                {...register("description", {
                  required: "Description is required",
                })}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none"
              />

              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="h-5 w-5"
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
                className="w-full rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 px-4 py-6"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  if (file.type !== "application/pdf") {
                    toast.error("Only PDF files are allowed");
                    e.target.value = "";
                    setBook(null);
                    return;
                  }

                  setBook(file);
                }}
              />

              {book && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {book.name}
                </p>
              )}
            </div>

            {/* Cover */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Cover Image
              </label>

              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
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
                className="w-full rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 px-4 py-6"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  if (!file.type.startsWith("image/")) {
                    toast.error("Only image files are allowed");
                    e.target.value = "";
                    setCover(null);
                    setCoverPreview(null);
                    return;
                  }

                  setCover(file);

                  const previewUrl = URL.createObjectURL(file);
                  setCoverPreview(previewUrl);
                }}
              />

              {cover && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {cover.name}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-xl bg-black dark:bg-black dark:text-white text-white py-4 font-semibold text-lg hover:opacity-90 transition disabled:opacity-50">
            {uploading ? "Uploading..." : "Upload Book"}
          </button>
        </form>
      </div>
    </div>
  );
}
