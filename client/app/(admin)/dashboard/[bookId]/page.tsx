"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { readBookService } from "@/fetchs/services";

import dynamic from "next/dynamic";
import MainLoader from "@/helper/MainLoder";

const BookReader = dynamic(() => import("./_component/BookReader"), {
  ssr: false,
  loading: () => (
    <>
      <MainLoader />
    </>
  ),
});
export default function ReaderPage() {
  const { bookId } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["read-book", bookId],
    queryFn: () => readBookService(bookId as string),
    enabled: !!bookId,
  });

  useEffect(() => {
    if (data) {
      queryClient.invalidateQueries({
        queryKey: ["user-points"],
      });
    }
  }, [data, queryClient]);

  console.log("BOOK DATA:", data);
  console.log("FILE PATH:", data?.filePath);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-white">
        Loading book...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-red-400">
        Failed to load book.
      </div>
    );
  }

  if (!data?.filePath) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-red-400">
        PDF file is missing.
      </div>
    );
  }

  return <BookReader file={data.filePath} bookId={bookId as string} />;
}
