import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/dashboard", "/owners/dashboard", "/admin", "/broker"];
const adminRoutes = ["/admin"];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "krishjazz-secret-key-change-in-production"
);

function isPublicBrowsePath(pathname: string) {
  return pathname === "/" || pathname === "/properties" || pathname.startsWith("/properties/");
}

function loginIntentForPath(pathname: string) {
  return pathname.startsWith("/owners/dashboard") ? "owner" : "buyer";
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isBrokerRoute = pathname.startsWith("/broker");
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isPublicBrowse = isPublicBrowsePath(pathname);
  const loginIntent = loginIntentForPath(pathname);

  const token = request.cookies.get("session")?.value;
  if (!token) {
    if (!isProtected) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("intent", loginIntent);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const brokerStatus = payload.brokerStatus as string | null | undefined;
    const jwtPermissionsVersion = Number(payload.permissionsVersion ?? 0);

    if (isBrokerRoute) {
      if (brokerStatus !== "APPROVED") {
        const dest = brokerStatus ? "/dashboard?tab=application" : "/brokers#broker-auth";
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }

    if (isAdminRoute && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const canList = Boolean(payload.canList);

    if (pathname === "/" && canList) {
      return NextResponse.redirect(new URL("/owners/dashboard", request.url));
    }

    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      if (canList) {
        const url = new URL("/owners/dashboard", request.url);
        url.search = request.nextUrl.search;
        return NextResponse.redirect(url);
      }
    }

    if (pathname.startsWith("/owners/dashboard") && !canList) {
      const url = new URL("/dashboard", request.url);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.headers.set("x-permissions-version", String(jwtPermissionsVersion));
    return response;
  } catch {
    if (isPublicBrowse) {
      const response = NextResponse.next();
      response.cookies.delete("session");
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("intent", loginIntent);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: [
    "/",
    "/properties/:path*",
    "/dashboard/:path*",
    "/owners/dashboard",
    "/owners/dashboard/:path*",
    "/admin/:path*",
    "/broker/:path*",
  ],
};
