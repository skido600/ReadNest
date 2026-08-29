"use client";

import { checkServer } from "@/fetchs/services";
import { useQuery } from "@tanstack/react-query";

export default function ServerStatus() {
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: ["server-health"],
    queryFn: checkServer,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    retry: 1,
  });

  const online = !isError && data?.success === true;

  return (
    <div className="fixed bottom-5 right-2 z-9999">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#101010]/95 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-md">
        <span
          className={`h-2 w-2 rounded-full ${
            online
              ? "bg-green-500"
              : isLoading || isFetching
                ? "animate-pulse bg-yellow-500"
                : "bg-red-500"
          }`}
        />

        <span className="text-xs">
          {online
            ? "Server online"
            : isLoading || isFetching
              ? "Waking server..."
              : "Server offline"}
        </span>
      </div>
    </div>
  );
}
