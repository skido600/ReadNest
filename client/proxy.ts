import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // const token = req.cookies.get("accessToken")?.value;
  // console.log("accesstoken", token);

  return NextResponse.next();
}
