import { SidebarProvider } from "@/app/context/Sidebar";
import { TanstackQueryProvider } from "@/app/context/TanstackQueryProvider";
import { UserProvider } from "@/app/context/UserContext";
import Usersidebar from "@/component/ClientComponents/Usersidebar";
import UserNavBar from "@/component/UserNavBar";
// TanstackQueryProvider
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
