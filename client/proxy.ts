import { NextRequest, NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/admin",
  "/deposit",
  "/discovery",
  "/favourite",
  "/new",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // refreshToken lives 7 days, accessToken only 15 min
  const isLoggedIn =
    Boolean(request.cookies.get("refreshToken")?.value) ||
    Boolean(request.cookies.get("accessToken")?.value);

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/deposit/:path*",
    "/discovery/:path*",
    "/favourite/:path*",
    "/new/:path*",
    "/books/:path*",
  ],
};
