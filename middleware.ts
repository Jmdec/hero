import { NextRequest, NextResponse } from "next/server";
import { hasModuleAccess, moduleForAdminPath, moduleForApiPath, normalizeRole } from "@/lib/rbac";

const SESSION_COOKIE = "session";
const API_BASE_URL = (process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/g, "");

function getLaravelApiUrl(path: string) {
  return `${API_BASE_URL}${API_BASE_URL.endsWith("/api") ? "" : "/api"}${path}`;
}

async function verifyAdminAccess(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return { authenticated: false, role: "guest" as const };

  try {
    const res = await fetch(getLaravelApiUrl("/auth/me"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return { authenticated: false, role: "guest" as const };

    const data = await res.json().catch(() => null);
    const rawRole = data?.data?.user?.role ?? data?.user?.role ?? data?.role;
    const role = normalizeRole(rawRole);
    return { authenticated: true, role };
  } catch {
    return { authenticated: false, role: "guest" as const };
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const fallbackModule =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin")
      ? "dashboard"
      : null;
  const requiredModule = moduleForAdminPath(pathname) ?? moduleForApiPath(pathname) ?? fallbackModule;
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/analytics") ||
    pathname.startsWith("/api/users");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const { authenticated, role } = await verifyAdminAccess(req);

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!requiredModule || !hasModuleAccess(role, requiredModule)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/analytics", "/api/users/:path*"],
};