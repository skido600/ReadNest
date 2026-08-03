"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Inputs } from "@/types/types";
import { useOtpVerification } from "./useOtpVerification";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
//login and forgetpassword logic is here
export function useLogin() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { reset } = useForm<Inputs>();
  const [messages, setMessage] = useState<any>();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [details, setDetails] = useState<{ email: string; token: string }>({
    email: "",
    token: "",
  });
  const router = useRouter();

  const [loginEmail, setLoginEmail] = useState("");
  const otp = useOtpVerification(loginEmail);
  const [loading, setLoading] = useState({
    login: false,
    forgotStep1: false,
    forgotStep2: false,
    forgotStep3: false,
  });

  // LOGIN
  const login = async (data: Inputs) => {
    if (!data.email_username || !data.password) return;
    setLoading((p) => ({ ...p, login: true }));
    setLoginEmail(data.email_username);
    try {
      const res = await fetch(`${backendUrl}/api/authv1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email_username,
          password: data.password,
        }),
      });

      const result = await res.json();
      console.log(result, "resulit from login");
      if (result.success) {
        const authenticated: any = result.data;
        setMessage("");
        reset();
        // console.log(result);
        // setTimeout(() => {
        // router.push("/dashboard");
        // }, 3000);
        localStorage.setItem("data", JSON.stringify(authenticated));
        toast.success(result.message, { duration: 10000 });
        router.push("/dashboard");
      } else {
        toast.error(result.message);
        setMessage(result.message);
      }
      if (
        result.message?.includes(
          "Your OTP expired. A new verification code has been sent to your email. Please check your inbox.",
        ) ||
        result.message?.includes("OTP expired") ||
        result.message?.includes(
          "check your email box and verify your email before logging in.",
        )
      ) {
        //  OTP REQUIRED CASE
        setMessage(result.message);
        toast.error(result.message);
        otp.setShowOtpModal(true);
        return;
      }
      if (!result.success) setMessage(result.message);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading((p) => ({ ...p, login: false }));
      setMessage("");
    }
  };

  // FORGOT STEP 1
  const forgotEmail = async (data: Inputs) => {
    if (!data.email_username) return;
    setLoading((p) => ({ ...p, forgotStep1: true }));

    try {
      const res = await fetch(`${backendUrl}/api/authv1/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email_username }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message, { duration: 10000 });
        setDetails({ email: data.email_username, token: "" });
        setStep(2);
      } else toast.error(result.message);
    } finally {
      setLoading((p) => ({ ...p, forgotStep1: false }));
    }
  };

  // FORGOT STEP 2
  const verifyOtp = async (data: Inputs) => {
    if (!data.otp) return;
    setLoading((p) => ({ ...p, forgotStep2: true }));

    try {
      const res = await fetch(`${backendUrl}/api/authv1/verifycode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: details.email, code: data.otp }),
      });

      const result = await res.json();
      if (result.success) {
        setDetails((p) => ({ ...p, token: result.data }));
        toast.success(result.message, { duration: 10000 });
        setStep(3);
      } else toast.error(result.message);
    } finally {
      setLoading((p) => ({ ...p, forgotStep2: false }));
    }
  };

  // FORGOT STEP 3
  const resetPassword = async (data: Inputs) => {
    if (!data.password || data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading((p) => ({ ...p, forgotStep3: true }));

    try {
      const res = await fetch(`${backendUrl}/api/authv1/resetpassword`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken: details.token,
          newPassword: data.password,
          confirmNewpassword: data.password,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message, { duration: 10000 });
        setShowForgot(false);
        setStep(1);
      } else toast.error(result.message);
    } finally {
      setLoading((p) => ({ ...p, forgotStep3: false }));
    }
  };

  return {
    // ui
    showPassword,
    setShowPassword,
    showHelp,
    setShowHelp,
    showForgot,
    setShowForgot,

    // flow
    step,
    setStep,

    // data
    messages,
    loading,

    // actions
    login,
    forgotEmail,
    verifyOtp,
    resetPassword,
    otp,
  };
}
