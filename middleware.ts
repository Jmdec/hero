import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session";
const API_BASE_URL = (process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/g, "");

function getLaravelApiUrl(path: string) {
  return `${API_BASE_URL}${API_BASE_URL.endsWith("/api") ? "" : "/api"}${path}`;
}

async function verifyAdminAccess(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return { authenticated: false, isAdmin: false };

  try {
    const res = await fetch(getLaravelApiUrl("/auth/me"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return { authenticated: false, isAdmin: false };

    const data = await res.json().catch(() => null);
    const role = data?.user?.role ?? data?.role;
    return { authenticated: true, isAdmin: role === "admin" };
  } catch {
    return { authenticated: false, isAdmin: false };
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/api/analytics";

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const { authenticated, isAdmin } = await verifyAdminAccess(req);

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!isAdmin) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/analytics"],
};