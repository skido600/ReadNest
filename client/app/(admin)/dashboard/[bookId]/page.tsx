"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { readBookService } from "@/fetchs/services";
import { useQueryClient } from "@tanstack/react-query";
export default function ReaderPage() {
  const { bookId } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["read-book", bookId],
    queryFn: () => readBookService(bookId as string),
  });
  queryClient.invalidateQueries({ queryKey: ["user-points"] });
  if (isLoading) return <p>Loading book...</p>;
  if (error) return <p>Failed to load book</p>;

  return (
    <div className="h-screen w-full flex justify-center bg-gray-100">
      <iframe src={data.filePath} className="w-full h-full" />
    </div>
  );
}
