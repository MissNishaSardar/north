import { NextRequest, NextResponse } from "next/server";

const privatePaths = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!privatePaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("better-auth.session_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
