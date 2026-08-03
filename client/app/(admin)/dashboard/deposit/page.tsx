"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { depositService } from "@/fetchs/services";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();
  const depositMutation = useMutation({
    mutationFn: depositService,

    onSuccess: (data) => {
      toast.success(data.message || "Deposit successful");

      setAmount("");
      queryClient.invalidateQueries({
        queryKey: ["user-points"],
      });
    },

    onError: (error: any) => {
      toast.error(error.message || "Deposit failed");
    },
  });

  function handleDeposit() {
    const value = Number(amount);

    // frontend validation
    if (!value || value <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (value > 5000) {
      toast.error("Maximum deposit is 5000 points");
      return;
    }

    depositMutation.mutate(value);
  }

  return (
    <div className="">
      <div className=" p-6 rounded-lg shadow-md w-[350px]">
        <h1 className="text-xl font-bold mb-4">Deposit Points</h1>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-3 border-neutral-800 focus:outline-none rounded mb-4"
        />

        <button
          onClick={handleDeposit}
          disabled={depositMutation.isPending}
          className="w-full bg-black text-white p-3 rounded">
          {depositMutation.isPending ? "Depositing..." : "Deposit"}
        </button>

        <p className="text-sm text-gray-500 mt-3">
          Maximum deposit: 5000 points
        </p>
      </div>
    </div>
  );
}
