"use client";

import { useMutation } from "@tanstack/react-query";
import { downloadBookService } from "@/fetchs/services";

export function useDownloadBook() {
  return useMutation({
    mutationFn: (bookId: string) => downloadBookService(bookId),

    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    },
  });
}
