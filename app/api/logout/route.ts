import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
