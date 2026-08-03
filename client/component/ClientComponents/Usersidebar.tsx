"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHome, FiCompass, FiHeart, FiLogOut } from "react-icons/fi";
import { BanknoteArrowUp, Shield } from "lucide-react";

import { useSidebar } from "@/app/context/Sidebar";
import { useUser } from "@/app/context/UserContext";
import { logout } from "@/fetchs/services";

function Usersidebar() {
  const { isOpen, close } = useSidebar();
  const router = useRouter();
  const { user } = useUser();

  // Lock page scrolling when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!user) return null;

  const userMenu = [
    {
      name: "Home",
      icon: FiHome,
      path: "/dashboard",
    },
    {
      name: "Discovery",
      icon: FiCompass,
      path: "/dashboard/discovery",
    },
    {
      name: "History",
      icon: FiHeart,
      path: "/dashboard/favourite",
    },
    {
      name: "Point depo",
      icon: BanknoteArrowUp,
      path: "/dashboard/deposit",
    },
  ];

  const adminMenu = [
    {
      name: "Home",
      icon: FiHome,
      path: "/dashboard",
    },
    {
      name: "Manage Books",
      icon: Shield,
      path: "/dashboard/admin",
    },
  ];

  const mainMenu = user.role === "admin" ? adminMenu : userMenu;

  const bottomMenu = [
    {
      name: "Logout",
      icon: FiLogOut,
      action: () => logout(router),
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-64 flex-col
          border-r border-neutral-200 dark:border-neutral-800
          bg-white dark:bg-black
          shadow-xl
          transform transition-transform duration-300
          overflow-hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="text-4xl font-Tagesschrift text-black dark:text-white">
            Bookflex
          </h1>
        </div>

        {/* Scrollable menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {mainMenu.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={close}
                className="
                  flex items-center gap-3
                  rounded-lg px-3 py-3
                  text-black dark:text-gray-300
                  hover:bg-purple-50 dark:hover:bg-neutral-900
                  transition-colors
                ">
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
          {bottomMenu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={item.action}
                className="
                  flex w-full items-center gap-3
                  rounded-lg px-3 py-3
                  text-red-600
                  hover:bg-red-50 dark:hover:bg-neutral-900
                  transition-colors
                ">
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}

export default Usersidebar;
