import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/dashboard", "/admin", "/broker"];
const adminRoutes = ["/admin"];
const brokerRestrictedRoutes = ["/", "/properties"];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "krishjazz-secret-key-change-in-production");

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isBrokerRestricted = brokerRestrictedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isBrokerRoute = pathname.startsWith("/broker");
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  const token = request.cookies.get("session")?.value;
  if (!token) {
    if (!isProtected) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.role === "BROKER") {
      if (isBrokerRestricted) {
        return NextResponse.redirect(new URL("/broker/properties", request.url));
      }
      if (isAdminRoute) {
        return NextResponse.redirect(new URL("/broker/properties", request.url));
      }
    }

    if (isBrokerRoute && payload.role !== "BROKER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isAdminRoute && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/", "/properties/:path*", "/dashboard/:path*", "/admin/:path*", "/broker/:path*"],
};
