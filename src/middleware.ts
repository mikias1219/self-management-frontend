import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants/auth";

const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && !isAuthRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/today") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname === "/more") {
    return NextResponse.redirect(new URL("/insights", request.url));
  }
  if (pathname === "/growth") {
    return NextResponse.redirect(new URL("/life?tab=learning", request.url));
  }
  if (pathname === "/life" && request.nextUrl.searchParams.get("tab") === "finance") {
    const financeUrl = new URL("/finance", request.url);
    const action = request.nextUrl.searchParams.get("action");
    if (action) financeUrl.searchParams.set("action", action);
    return NextResponse.redirect(financeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|.*\\..*).*)"],
};
