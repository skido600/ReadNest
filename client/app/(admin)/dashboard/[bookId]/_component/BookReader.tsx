"use client";

import { useDownloadBook } from "@/hooks/use-download-book";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookReaderProps {
  file: string;
  bookId: string;
  /** Where the Home button goes. Change to match your route. */
  homeHref?: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const DESKTOP_MAX_PAGE_WIDTH = 900;

export default function BookReader({
  file,
  bookId,
  homeHref = "/dashboard",
}: BookReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(
    null,
  );

  const downloadBook = useDownloadBook();

  // Measure available width so the page fits the screen at 100%
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Mobile only: the reader is a full-screen overlay, so lock body scroll
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const prev = document.body.style.overflow;
    const apply = () => {
      document.body.style.overflow = mq.matches ? "hidden" : prev;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = prev;
    };
  }, []);

  const clamp = (v: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));

  const previousPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const nextPage = () => setPageNumber((p) => Math.min(p + 1, numPages));
  const zoomIn = () => setScale((v) => clamp(+(v + 0.25).toFixed(2)));
  const zoomOut = () => setScale((v) => clamp(+(v - 0.25).toFixed(2)));
  const resetZoom = () => setScale(1);

  // Pinch-to-zoom (zooms the PDF only, not the whole site)
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        pinchRef.current = {
          startDist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
          startScale: scale,
        };
      }
    },
    [scale],
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const next =
        pinchRef.current.startScale * (dist / pinchRef.current.startDist);
      setScale(clamp(+next.toFixed(2)));
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);

  if (!file) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-white">
        No PDF file specified.
      </div>
    );
  }

  const isDesktop = containerWidth >= 768;
  const baseWidth = isDesktop
    ? Math.min(containerWidth - 64, DESKTOP_MAX_PAGE_WIDTH)
    : containerWidth - 16;
  const pageWidth = Math.max(baseWidth, 200) * scale;

  const btn =
    "rounded-lg bg-neutral-800 text-sm hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    // Mobile: full-screen overlay above the site nav.
    // Desktop (md+): normal in-page layout, so your site nav/sidebar stays.
    <div className="fixed inset-0 z-100 flex flex-col bg-neutral-900 text-white md:static md:z-auto md:h-dvh md:min-h-0">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-700 bg-neutral-900 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-4 md:py-3">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          {/* Back to dashboard */}
          <Link
            href={homeHref}
            aria-label="Back to dashboard"
            className="flex h-9 items-center gap-1.5 rounded-lg bg-neutral-800 px-3 text-sm hover:bg-neutral-700">
            <span aria-hidden>←</span>
            <span>Home</span>
          </Link>

          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
            className={`ml-2 hidden h-9 w-9 md:block ${btn}`}>
            ‹
          </button>

          <span className="hidden min-w-[70px] text-center text-sm tabular-nums text-neutral-300 md:block">
            {pageNumber} / {numPages || "…"}
          </span>

          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            aria-label="Next page"
            className={`hidden h-9 w-9 md:block ${btn}`}>
            ›
          </button>
        </div>

        {/* Zoom + download */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label="Zoom out"
            className={`h-9 w-9 text-lg ${btn}`}>
            −
          </button>

          <button
            onClick={resetZoom}
            aria-label="Reset zoom"
            className="min-w-[52px] rounded-lg px-1 py-2 text-center text-xs text-neutral-300 hover:bg-neutral-800 md:text-sm">
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label="Zoom in"
            className={`h-9 w-9 text-lg ${btn}`}>
            +
          </button>

          <button
            onClick={() => downloadBook.mutate(bookId)}
            disabled={downloadBook.isPending}
            className="ml-1 h-9 whitespace-nowrap rounded-lg bg-white px-3 text-sm font-medium text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 md:ml-2 md:px-4">
            {downloadBook.isPending ? "Downloading..." : "↓ Download"}
          </button>
        </div>
      </div>

      {/* PDF area */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-x pan-y" }}
        className="min-h-0 flex-1 overflow-auto bg-neutral-800 p-2 md:p-8">
        <div className="m-auto w-fit shadow-lg">
          <Document
            file={file}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="py-20 text-center text-white">Loading PDF...</div>
            }
            error={
              <div className="py-20 text-center text-red-400">
                Failed to load this book.
              </div>
            }>
            {containerWidth > 0 && (
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                renderTextLayer
                renderAnnotationLayer
              />
            )}
          </Document>
        </div>
      </div>

      {/* Bottom navigation: mobile only (desktop has it in the toolbar) */}
      <div className="flex shrink-0 items-center justify-center gap-3 border-t border-neutral-700 bg-neutral-900 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <button
          onClick={previousPage}
          disabled={pageNumber <= 1}
          className={`flex-1 px-4 py-2.5 ${btn}`}>
          ← Prev
        </button>
        <span className="min-w-16 text-center text-sm tabular-nums text-neutral-300">
          {pageNumber} / {numPages || "…"}
        </span>
        <button
          onClick={nextPage}
          disabled={pageNumber >= numPages}
          className={`flex-1 px-4 py-2.5 ${btn}`}>
          Next →
        </button>
      </div>
    </div>
  );
}
