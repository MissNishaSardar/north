import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";

const PRIVATE_PATHS = new Set(["/dashboard", "/admin", "/profile"]);
const AUTH_PATHS = new Set(["/sign-in", "/sign-up"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (PRIVATE_PATHS.has(pathname)) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (pathname === "/admin") {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      if (session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  }

  if (AUTH_PATHS.has(pathname) && sessionCookie) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|uploads).*)",
  ],
};
