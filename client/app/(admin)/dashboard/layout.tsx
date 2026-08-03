import { SidebarProvider } from "@/app/context/Sidebar";
import { TanstackQueryProvider } from "@/app/context/TanstackQueryProvider";
import { UserProvider } from "@/app/context/UserContext";
import Usersidebar from "@/component/ClientComponents/Usersidebar";
import UserNavBar from "@/component/UserNavBar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const res = await fetch(`${backendUrl}/api/book/me`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    redirect("/login");
  }

  if (data.data.role !== "admin" && data.data.role !== "user") {
    redirect("/");
  }

  return (
    <TanstackQueryProvider>
      <UserProvider>
        <SidebarProvider>
          <div className="min-h-screen w-full flex">
            {/* Sidebar */}
            <aside className="md:w-64">
              {" "}
              <Usersidebar />
            </aside>

            {/* Right side: Navbar + Main content */}
            <div className="flex-1 flex flex-col">
              <div className="fixed top-0 left-0 md:left-64 right-0 z-50">
                <UserNavBar />
              </div>
              {/* Main content */}
              <main className="flex-1 py-2  pt-24  px-4">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </UserProvider>
    </TanstackQueryProvider>
  );
}
