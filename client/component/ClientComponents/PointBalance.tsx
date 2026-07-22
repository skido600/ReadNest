"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserPoints } from "@/fetchs/services";
import { Star } from "lucide-react";
export default function PointBalance() {
  const { data, isLoading } = useQuery({
    queryKey: ["user-points"],
    queryFn: getUserPoints,
  });

  if (isLoading) {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-2  px-3 py-1 rounded-full">
      <span className="text-yellow-600">
        <Star size={13} />
      </span>

      <span className="font-semibold text-xs">{data?.points ?? 0} Points</span>
    </div>
  );
}
