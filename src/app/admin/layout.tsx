"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    FileSpreadsheet,
    Users,
    MessagesSquare,
    MailQuestion,
    Megaphone,
    MessageCircleHeart,
    Newspaper,
    ArrowLeft,
    Menu,
    Bell,
    User,
    ChevronDown,
    Settings,
    LogOut,
} from "lucide-react";

const menuItems = [
    {
        section: "Menu",
        items: [
            {
                title: "Dashboard",
                href: "/admin",
                icon: LayoutDashboard,
            },
            {
                title: "Quotation",
                href: "/admin/quotation",
                icon: FileSpreadsheet,
            },
            {
                title: "Users",
                href: "/admin/users",
                icon: Users,
            },
            {
                title: "Chats",
                href: "/admin/chats",
                icon: MessagesSquare,
            },
            {
                title: "Inquiries",
                href: "/admin/inquiries",
                icon: MailQuestion,
            },
            {
                title: "Announcements",
                href: "/admin/announcements",
                icon: Megaphone,
            },
            {
                title: "Testimonials",
                href: "/admin/testimonials",
                icon: MessageCircleHeart,
            },
            {
                title: "Blogs",
                href: "/admin/blogs",
                icon: Newspaper,
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
    const [user, setUser] = useState<any>(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/");
    };

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                if (process.env.NODE_ENV !== "production") {
                    setUser({ id: 0, name: "Admin Demo", email: "admin@demo.local", role: "admin" });
                    setLoading(false);
                    return;
                }

                router.replace("/login");
                return;
            }

            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.role !== "admin") {
                router.replace("/");
                return;
            }

            setUser(parsedUser);
            setLoading(false);
        } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            router.replace("/login");
        }
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F0EDE7]">
                <div className="w-5 h-5 border-2 border-[#0F1B2D] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F0EDE7]">

            {/* ── Mobile overlay ── */}
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

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-screen w-64
                    bg-white shadow-sm flex flex-col
                    transition-transform duration-300
                    lg:translate-x-0
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Logo */}
                <div className="flex-col justify-center items-center px-5 py-2 border-b border-[#d1d4da] shrink-0">
                    <Image
                        src="/header_logo_manila.png"
                        alt="HERO Serviced Office Logo"
                        width={200}
                        height={50}
                    />
                    <h1 className="flex items-center justify-center py-2 text-[#0A1E3F] font-bold">
                        ADMIN PANEL
                    </h1>
                </div>

                {/* Nav — scrollable if items overflow */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
                    {menuItems.map(({ section, items }) => (
                        <div key={section}>
                            {items.filter(item => item?.href?.trim()).map(({ title, href, icon: Icon }) => {
                                const active = pathname === href;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 my-2 rounded-md text-md border-l-2 transition-all ${active
                                                ? "bg-[#0A1E3F]/10 text-[#0A1E3F] border-[#4F8EF7] font-bold"
                                                : "text-[#0D47A1] border-transparent hover:bg-[#0A1E3F]/5 hover:text-[#1565C0]"
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#4F8EF7]" : ""}`} />
                                        {title}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Footer nav — always pinned to bottom of sidebar */}
                <div className="px-3 pb-4 pt-2 border-t border-[#d1d4da] shrink-0">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-md text-[#0D47A1] border-transparent hover:bg-[#0A1E3F]/5 hover:text-[#1565C0] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main area — offset by sidebar width on desktop */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

                {/* Top Navbar — sticky so it stays on scroll */}
                <header className="sticky top-0 z-30 md:mt-2 md:mb-1 md:mx-2 md:rounded-xl shadow-sm h-14 bg-white border-b border-[#DDD9D0] px-4 md:px-6 lg:px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-5 h-5 text-[#1A2A3E]" />
                        </button>

                        <span className="sm:text-lg md:text-2xl font-bold text-[#0A1E3F]">
                            {menuItems
                                .flatMap((s) => s.items)
                                .find((i) => i.href === pathname)?.title ?? "Admin"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1B3A8C]/10 hover:bg-[#1B3A8C]/20 text-[#1B3A8C] border border-[#1B3A8C]/30 rounded-full transition-all"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden md:block text-xs md:text-sm font-medium">{user?.name}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
                                        >
                                            <div className="p-4 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link
                                                    href="/admin/settings"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>Profile Settings</span>
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-white md:my-2 md:mx-2 md:rounded-xl shadow-sm">
                    {children}
                </main>
            </div>
        </div>
    );
}