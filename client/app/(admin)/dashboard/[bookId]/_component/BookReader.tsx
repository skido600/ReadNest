"use client";

import { useDownloadBook } from "@/hooks/use-download-book";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookReaderProps {
  file: string;
  bookId: string;
}

export default function BookReader({ file, bookId }: BookReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  const downloadBook = useDownloadBook();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function previousPage() {
    setPageNumber((page) => Math.max(page - 1, 1));
  }

  function nextPage() {
    setPageNumber((page) => Math.min(page + 1, numPages));
  }

  function zoomIn() {
    setScale((value) => Math.min(value + 0.2, 2.5));
  }

  function zoomOut() {
    setScale((value) => Math.max(value - 0.2, 0.6));
  }

  if (!file) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-white">
        No PDF file specified.
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-neutral-900">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-700 bg-neutral-900 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40">
            ←
          </button>

          <span className="min-w-[90px] text-center text-sm">
            {pageNumber} / {numPages || "..."}
          </span>

          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40">
            →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">
            −
          </button>

          <span className="min-w-[55px] text-center text-sm">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">
            +
          </button>

          {/* Download */}
          <button
            onClick={() => downloadBook.mutate(bookId)}
            disabled={downloadBook.isPending}
            className="ml-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50">
            {downloadBook.isPending ? "Downloading..." : "↓ Download"}
          </button>
        </div>
      </div>

      {/* PDF */}
      <div className="flex flex-1 justify-center overflow-auto bg-neutral-800 px-4 py-8">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="py-20 text-center text-white">Loading PDF...</div>
          }
          error={
            <div className="py-20 text-center text-red-400">
              Failed to load this book.
            </div>
          }>
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer
            renderAnnotationLayer
          />
        </Document>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-center gap-4 border-t border-neutral-700 bg-neutral-900 p-3 text-white">
        <button
          onClick={previousPage}
          disabled={pageNumber <= 1}
          className="rounded-lg bg-neutral-800 px-4 py-2 disabled:opacity-40">
          Previous
        </button>

        <span className="text-sm text-neutral-300">
          Page {pageNumber} of {numPages}
        </span>

        <button
          onClick={nextPage}
          disabled={pageNumber >= numPages}
          className="rounded-lg bg-neutral-800 px-4 py-2 disabled:opacity-40">
          Next
        </button>
      </div>
    </div>
  );
}
