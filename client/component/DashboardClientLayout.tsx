"use client";
import { SidebarProvider } from "@/app/context/Sidebar";
import { TanstackQueryProvider } from "@/app/context/TanstackQueryProvider";
import { UserProvider } from "@/app/context/UserContext";
import Usersidebar from "@/component/ClientComponents/Usersidebar";
import UserNavBar from "@/component/UserNavBar";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLoader from "@/helper/MainLoder";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/book/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return <MainLoader />;
  }
  return (
    <TanstackQueryProvider>
      <UserProvider>
        <SidebarProvider>
          <div className="min-h-screen w-full flex">
            {/* Sidebar spacer: reserves 256px only from 1100px up */}
            <aside className="min-[1100px]:w-64 min-[1100px]:shrink-0">
              <Usersidebar />
            </aside>

            {/* Right side: Navbar + Main content */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="fixed top-0 left-0 min-[1100px]:left-64 right-0 z-30">
                <UserNavBar />
              </div>

              <main className="flex-1 py-2 pt-24 px-4">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </UserProvider>
    </TanstackQueryProvider>
  );
}
