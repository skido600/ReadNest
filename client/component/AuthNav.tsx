import Image from "next/image";
import React from "react";
import Link from "next/link";

function AuthNav() {
  return (
    <section>
      <div className="border-b border-[#4b292b]">
        <Link href="/">
          <div className="flex items-center">
            <Image
              src="/logo/white_logo.png"
              alt="logo"
              width={0}
              height={0}
              sizes="100vw"
              className="w-20 h-20 object-contain"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}

export default AuthNav;
