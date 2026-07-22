"use client";

import { useState, useEffect } from "react";
import { CgMenuRight } from "react-icons/cg";
import { FiHome, FiCompass, FiHeart, FiLogOut } from "react-icons/fi";
import { BanknoteArrowUp } from "lucide-react";
import { Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "@/app/context/Sidebar";
import { logout } from "@/fetchs/services";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";

function Usersidebar() {
  const { isOpen, close } = useSidebar();
  const router = useRouter();
  const { user } = useUser();

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
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-0  z-50  w-64 bg-white dark:bg-black
        border-r border-neutral-200  dark:border-neutral-800
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}>
        {/* Logo */}
        <div className="flex pt-2 justify-center  h-16 border-b  border-neutral-200 dark:border-neutral-800">
          <h1 className="text-black dark:text-white text-4xl font-Tagesschrift">
            Bookflex
          </h1>
        </div>

        {/* Main menu */}
        <nav className="flex flex-col px-3 py-4 space-y-8">
          {mainMenu.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={close}
                className="flex items-center gap-3 px-3 py-2 rounded-lg
                text-black dark:text-gray-300
                hover:bg-purple-50 dark:hover:bg-neutral-900
                transition">
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="absolute bottom-0 w-full px-3 py-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
          {bottomMenu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={item.action}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg
        text-red-600 hover:bg-red-50 dark:hover:bg-neutral-900
        transition">
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
