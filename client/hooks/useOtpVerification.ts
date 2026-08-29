"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const OTP_DURATION = 10 * 60;

export function useOtpVerification(email: string) {
  const router = useRouter();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  /*TIMER  */
  useEffect(() => {
    if (!showOtpModal) return;

    setTimeLeft(OTP_DURATION);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOtpModal]);

  useEffect(() => {
    if (timeLeft === 0) {
      toast.error("OTP expired");
      setShowOtpModal(false);
      router.push("/login");
    }
  }, [timeLeft, router]);

  /* VERIFY  */
  const verifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Enter valid OTP");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch(`${backendUrl}/api/authv1/verifyemail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      // console.log("email check", email);
      const result = await res.json();
      // console.log(result);
      if (result.success) {
        toast.success(result.message, { duration: 10000 });
        setShowOtpModal(false);
      } else {
        toast.error(result.message);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setVerifying(false);
    }
  };

  /*INPUT  */
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  return {
    showOtpModal,
    setShowOtpModal,
    otp,
    verifying,
    timeLeft,
    verifyOtp,
    handleOtpChange,
    handleOtpKeyDown,
    formatTime,
  };
}
