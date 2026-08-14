"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  MessagesSquare,
  MailQuestion,
  Megaphone,
  MessageCircleHeart,
  ArrowLeft,
  Menu,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Loader2,
  X,
} from "lucide-react";
import { Loading } from "@/components/Loading";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "admin" | "operation";

const ROLES: Record<string, AppRole> = {
  ADMINISTRATIVE: "admin",
  OPERATION: "operation",
};

const menuItems = [
  {
    section: "Menu",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        roles: [ROLES.ADMINISTRATIVE, ROLES.OPERATION],
      },
      {
        title: "Quotation",
        href: "/admin/quotation",
        icon: FileSpreadsheet,
        roles: [ROLES.ADMINISTRATIVE, ROLES.OPERATION],
      },
      {
        title: "Chat",
        href: "/admin/chats",
        icon: MessagesSquare,
        roles: [ROLES.ADMINISTRATIVE, ROLES.OPERATION],
      },
      {
        title: "Inquiry",
        href: "/admin/inquiries",
        icon: MailQuestion,
        roles: [ROLES.ADMINISTRATIVE, ROLES.OPERATION],
      },
      {
        title: "Announcement",
        href: "/admin/announcements",
        icon: Megaphone,
        roles: [ROLES.ADMINISTRATIVE, ROLES.OPERATION],
      },
      {
        title: "Testimonial",
        href: "/admin/testimonials",
        icon: MessageCircleHeart,
        roles: [ROLES.ADMINISTRATIVE, ROLES.OPERATION],
      },
      {
        title: "User",
        href: "/admin/users",
        icon: Users,
        roles: [ROLES.ADMINISTRATIVE],
      },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, isAdmin, isAuthReady, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const role = user?.role as AppRole | undefined;
  const isAdministrative = isAdmin;
  const isOperation = role === ROLES.OPERATION;
  const canAccessAdminArea = isAdministrative || isOperation;

  const visibleMenuItems = menuItems.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !!role && item.roles.includes(role)
    ),
  }));

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  // Close mobile sidebar automatically whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated || !user) {
      router.replace("/");
      return;
    }

    if (!canAccessAdminArea) {
      router.replace("/");
      return;
    }

    setLoading(false);
  }, [isAuthReady, isAuthenticated, canAccessAdminArea, router, user]);

  if (loading) {
    return (
      <Loading
        variant="screen"
        title="Loading admin workspace"
        subtitle="Hero Serviced Office — Admin"
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F0EDE7]">
      {/* Mobile / tablet overlay — shown below the lg breakpoint whenever the
          drawer is open, since the sidebar is fixed+off-canvas until lg. */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — off-canvas drawer on mobile/tablet, fixed rail from lg up.
          w-72 on small screens gives touch targets more breathing room;
          lg:w-64 keeps the original desktop width. */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 max-w-[85vw]
          bg-white shadow-sm flex flex-col
          transition-transform duration-300 ease-in-out
          lg:w-64 lg:max-w-none lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo + mobile close button */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-[#d1d4da] shrink-0">
          <div className="flex flex-col items-center flex-1 min-w-0">
            <Image
              src="/header_logo_manila.png"
              alt="HERO Serviced Office Logo"
              width={180}
              height={45}
              className="h-auto w-auto max-w-[160px] sm:max-w-[180px]"
              priority
            />
            <h1 className="flex items-center justify-center py-2 text-sm sm:text-base text-[#0A1E3F] font-bold text-center">
              ADMIN PANEL
            </h1>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden shrink-0 p-1.5 rounded-md text-[#0A1E3F] hover:bg-[#0A1E3F]/5"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
          {visibleMenuItems.map(({ section, items }) => (
            <div key={section}>
              {items
                .filter((item) => item?.href?.trim())
                .map(({ title, href, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 my-2 rounded-md text-sm sm:text-md border-l-2 transition-all ${
                        active
                          ? "bg-[#0A1E3F]/10 text-[#0A1E3F] border-[#4F8EF7] font-bold"
                          : "text-[#0D47A1] border-transparent hover:bg-[#0A1E3F]/5 hover:text-[#1565C0]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#4F8EF7]" : ""}`} />
                      <span className="truncate">{title}</span>
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>

        {/* Footer nav */}
        <div className="px-3 pb-4 pt-2 border-t border-[#d1d4da] shrink-0">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm sm:text-md text-[#0D47A1] border-transparent hover:bg-[#0A1E3F]/5 hover:text-[#1565C0] transition-all"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="truncate">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main area — no left margin until lg, since the sidebar is off-canvas
          below that breakpoint (it would otherwise reserve dead space). */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="sticky top-0 z-30 lg:mt-2 lg:mb-1 lg:mx-2 lg:rounded-xl shadow-sm min-h-14 bg-white border-b border-[#DDD9D0] px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden shrink-0 p-1"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-[#1A2A3E]" />
            </button>

            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#0A1E3F] truncate">
              {menuItems.flatMap((s) => s.items).find((i) => i.href === pathname)?.title ?? "Admin"}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-[#1B3A8C]/10 hover:bg-[#1B3A8C]/20 text-[#1B3A8C] border border-[#1B3A8C]/30 rounded-full transition-all"
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="hidden md:block max-w-[10rem] truncate text-xs md:text-sm font-medium">
                  {user?.name}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
                    >
                      <div className="p-4 border-b border-gray-100 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        {/* Profile Settings is an Administrative-only privilege */}
                        {/* {isAdministrative && (
                          <Link
                            href="/admin/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Profile Settings</span>
                          </Link>
                        )} */}

                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4" />
                          )}

                          <span>
                            {isLoggingOut ? "Logging out..." : "Logout"}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 bg-white lg:my-2 lg:mx-2 lg:rounded-xl shadow-sm overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}