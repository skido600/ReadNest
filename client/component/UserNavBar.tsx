"use client";

import { Search } from "lucide-react";
import { useSidebar } from "@/app/context/Sidebar";

import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ClientComponents/ThemeToggle";
import PointBalance from "./ClientComponents/PointBalance";
function UserNavBar() {
  const { isOpen, toggle } = useSidebar();
  return (
    <main>
      <section className="flex items-center justify-between px-2 h-16   border-b border-neutral-200  dark:border-neutral-800  bg-[#ffffff] dark:bg-black ">
        {/* Left Menu */}
        {/* <ul className="flex items-center gap-6 text-gray-700 dark:text-gray-200">
          <li className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Search books..."
              className="
    pl-9 pr-3 py-1.5 rounded-md
    border border-gray-300 dark:border-neutral-800
    bg-white dark:bg-[#111214] dark:text-gray-200
    focus:outline-none

    w-48          
    sm:w-48       
    md:w-64       
  "
            />
          </li>
        </ul> */}
        <PointBalance />
        {/* Right Controls */}
        <div>
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
