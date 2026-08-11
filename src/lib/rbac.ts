export type AppRole = "admin" | "manager" | "guest";

export type AdminModuleKey =
  | "dashboard"
  | "quotation"
  | "users"
  | "chats"
  | "inquiry"
  | "announcements"
  | "testimonials"
  | "profile";

export const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  admin: "Admin / General Manager",
  manager: "Sales / Marketing / Branch Manager",
  guest: "Guest",
};

export const rolePermissions: Record<AppRole, AdminModuleKey[]> = {
  admin: [
    "dashboard",
    "quotation",
    "users",
    "chats",
    "inquiry",
    "announcements",
    "testimonials",
    "profile",
  ],
  manager: [
    "dashboard",
    "quotation",
    "chats",
    "inquiry",
    "announcements",
    "testimonials",
    "profile",
  ],
  guest: [],
};

const MANAGER_ALIASES = new Set([
  "sales",
  "marketing",
  "branch_manager",
  "branch-manager",
  "branch manager",
  "manager",
]);

export function normalizeRole(input: string | null | undefined): AppRole {
  const role = String(input ?? "")
    .trim()
    .toLowerCase();

  if (role === "admin") return "admin";
  if (MANAGER_ALIASES.has(role)) return "manager";
  return "guest";
}

export function hasModuleAccess(
  role: AppRole,
  module: AdminModuleKey,
): boolean {
  return rolePermissions[role]?.includes(module) ?? false;
}

export function moduleForAdminPath(pathname: string): AdminModuleKey | null {
  if (!pathname.startsWith("/admin")) return null;
  if (pathname === "/admin" || pathname.startsWith("/admin?")) return "dashboard";
  if (pathname.startsWith("/admin/quotation")) return "quotation";
  if (pathname.startsWith("/admin/users")) return "users";
  if (pathname.startsWith("/admin/chats")) return "chats";
  if (pathname.startsWith("/admin/inquiries")) return "inquiry";
  if (pathname.startsWith("/admin/announcements")) return "announcements";
  if (pathname.startsWith("/admin/testimonials")) return "testimonials";
  if (pathname.startsWith("/admin/settings")) return "profile";
  return null;
}

export function moduleForApiPath(pathname: string): AdminModuleKey | null {
  if (pathname.startsWith("/api/analytics")) return "dashboard";
  if (pathname.startsWith("/api/admin/testimonials")) return "testimonials";
  if (pathname.startsWith("/api/admin/announcements")) return "announcements";
  if (pathname.startsWith("/api/admin/inquiries")) return "inquiry";
  if (pathname.startsWith("/api/admin/contacts")) return "inquiry";
  if (pathname.startsWith("/api/users")) return "users";
  return null;
}
