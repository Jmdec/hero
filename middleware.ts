import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session";
const API_BASE_URL = (process.env.LARAVEL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/g, "");

const ADMIN_AREA_ROLES = new Set(["admin", "operation"]);

function getLaravelApiUrl(path: string) {
  return `${API_BASE_URL}${API_BASE_URL.endsWith("/api") ? "" : "/api"}${path}`;
}

async function verifyAdminAccess(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return { authenticated: false, role: null as string | null };

  try {
    const res = await fetch(getLaravelApiUrl("/auth/me"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return { authenticated: false, role: null as string | null };

    const data = await res.json().catch(() => null);
    const role = data?.user?.role ?? data?.role ?? null;
    return { authenticated: true, role };
  } catch {
    return { authenticated: false, role: null as string | null };
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

  const { authenticated, role } = await verifyAdminAccess(req);

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin and Operation roles may both enter the admin area. Finer-grained
  // restrictions (e.g. Operation cannot manage Users or reach Profile
  // Settings) are enforced in the UI via AdminLayout.tsx and must ALSO be
  // enforced on the corresponding API routes themselves (e.g.
  // /api/admin/users, /api/analytics) since this middleware only gates
  // entry to the admin area as a whole, not per-resource permissions.
  const isAdminArea = !!role && ADMIN_AREA_ROLES.has(role);

  if (!isAdminArea) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Operation role is not permitted to manage Users or reach Analytics —
  // enforce that here too, in addition to hiding the links in the UI.
  const isAdmin = role === "admin";
  const isOperationRestricted =
    !isAdmin &&
    (pathname.startsWith("/admin/users") ||
      pathname.startsWith("/api/admin/users") ||
      pathname === "/api/analytics");

  if (isOperationRestricted) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/analytics"],
};