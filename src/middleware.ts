import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/dashboard", "/admin", "/broker"];
const adminRoutes = ["/admin"];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "krishjazz-secret-key-change-in-production"
);

function isPublicBrowsePath(pathname: string) {
  return pathname === "/" || pathname === "/properties" || pathname.startsWith("/properties/");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isBrokerRoute = pathname.startsWith("/broker");
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isPublicBrowse = isPublicBrowsePath(pathname);

  const token = request.cookies.get("session")?.value;
  if (!token) {
    if (!isProtected) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("intent", "buyer");
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const brokerStatus = payload.brokerStatus as string | null | undefined;

    if (isBrokerRoute) {
      if (brokerStatus !== "APPROVED") {
        const tab = brokerStatus ? "application" : "apply-broker";
        return NextResponse.redirect(new URL(`/dashboard?tab=${tab}`, request.url));
      }
    }

    if (isAdminRoute && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    if (isPublicBrowse) {
      const response = NextResponse.next();
      response.cookies.delete("session");
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("intent", "buyer");
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/", "/properties/:path*", "/dashboard/:path*", "/admin/:path*", "/broker/:path*"],
};
