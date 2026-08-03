"use client";

import { Search } from "lucide-react";
import { useSidebar } from "@/app/context/Sidebar";

import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ClientComponents/ThemeToggle";
import PointBalance from "./ClientComponents/PointBalance";
import { useUser } from "@/app/context/UserContext";

function UserNavBar() {
  const { isOpen, toggle } = useSidebar();
  const { user } = useUser();
  if (!user) return null;
  return (
    <main>
      <section className="flex items-center justify-between px-2 h-16   border-b border-neutral-200  dark:border-neutral-800  bg-[#ffffff] dark:bg-black ">
        {/* Left Menu */}
        <div>
          {user.role === "admin" ? (
            <p className="text-sm">Admin panel</p>
          ) : (
            <PointBalance />
          )}
        </div>

        {/* Right Controls */}

        <div>
          {" "}
          <ThemeToggle />
          <button
            onClick={toggle}
            className="md:hidden p-2 rounded-lg bg-neutral-900">
            {isOpen ? (
              <X size={20} className="text-white" />
            ) : (
              <Menu size={20} className="text-white" />
            )}
          </button>
        </div>
      </section>
    </main>
  );
}

export default UserNavBar;
