"use client";
import React from "react";
// import HerosectionWaitlist from "./HerosectionWaitlist";
// import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link as ScrollLink } from "react-scroll";
import Link from "next/link";
import { usePathname } from "next/navigation";
const firstdetailsList = [
  { name: "About us", link: "/about" },
  { name: "Contact", link: "/contact" },
];

function Footer() {
  const pathname = usePathname();

  const isHome = pathname === "/";

  return (
    <footer className="bg-[#000000] text-white py-20 px-6 md:px-20 border-t border-white/10">
      {/* Top CTA Section */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Ready to Read? Enter your email to create or restart your membership.
        </h1>
        {/* <HerosectionWaitlist /> */}
      </div>

      {/* Middle Footer Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 text-sm text-gray-400 mb-12">
        <div>
          <h3 className="text-white font-semibold mb-3">ReadNest</h3>
          <ul className="space-y-4">
            {firstdetailsList.map((items: any, index: number) => (
              <Link key={index} href={items.link} className="cursor-pointer">
                <li>{items.name}</li>
              </Link>
            ))}
            {isHome && (
              <li className="cursor-pointer">
                <ScrollLink to="FAQ" smooth={true} duration={500}>
                  FAQs
                </ScrollLink>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Support</h3>
          <ul className="space-y-2">
            <li className="cursor-pointer">
              <Link href="/help"> Help Center </Link>
            </li>
            <li className="cursor-pointer">
              <Link href="/privacy"> Privacy Policy </Link>
            </li>
            <li className="cursor-pointer">
              <Link href="/teams">Terms of Use</Link>
            </li>
          </ul>
        </div>
        {/* 
        <div>
          <h3 className="text-white font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4 mt-2">
            <Facebook className="w-5 h-5 text-gray-400 hover:text-pink-500 cursor-pointer" />
            <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-500 cursor-pointer" />
            <Twitter className="w-5 h-5 text-gray-400 hover:text-pink-500 cursor-pointer" />
            <Youtube className="w-5 h-5 text-gray-400 hover:text-pink-500 cursor-pointer" />
          </div>
        </div> */}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 pt-6 text-center text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-pink-500">ReadNest</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
