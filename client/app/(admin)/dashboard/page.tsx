"use client";

import AdminUploadBook from "@/component/AdminUploadBook";
import MainDashbaord from "@/component/Main_dashbaord";
import { useUser } from "@/app/context/UserContext";

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) return null;

  if (user.role === "admin") {
    return <AdminUploadBook />;
  }

  return <MainDashbaord />;
}
