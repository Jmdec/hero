"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    FileText,
    Settings,
    LogOut,
    Megaphone,
    Bell,
    ArrowLeft,
    User,
    ChevronDown,
    Menu,
    X,
} from "lucide-react";

const menuItems = [
    {
        section: "Menu", items: [
            { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
            { title: "Users", href: "/admin/users", icon: Users },
            { title: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
            { title: "Announcements", href: "/admin/announcements", icon: Megaphone },
            { title: "Blogs", href: "/admin/blogs", icon: FileText },
        ]
    },
    {
        section: "General", items: [
            { title: "Settings", href: "/admin/settings", icon: },
        ]
    }
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
        <div className="flex min-h-screen overflow-hidden bg-[#F0EDE7]">
            {/* Mobile Overlay */}
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

            <aside
                className={`lg:m-2 rounded-r-lg lg:rounded-lg h-full lg:h-auto fixed lg:static z-50 top-0 left-0 w-64 bg-[#0F1B2D] flex flex-col transform transition-transform duration-300
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

                {/* Logo */}
                <div className="flex justify-center items-center px-5 py-6 border-b border-white/[0.07]">
                    <Image
                        src="/header_logo_manila.png"
                        alt="HERO Serviced Office Logo"
                        width={200}
                        height={50}
                    />
                </div>

                {/* SideNav */}
                <nav className="flex-1 px-3 py-6 flex flex-col gap-0.5">
                    {menuItems.map(({ section, items }) => (
                        <div key={section}>
                            <p className="text-[10px] text-[#3A5570] tracking-widest uppercase font-medium px-2 mt-3 mb-1.5">
                                {section}
                            </p>
                            {items.map(({ title, href, icon: Icon }) => {
                                const active = pathname === href;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] border-l-2 transition-all ${active
                                            ? "bg-[#4F8EF7]/10 text-[#E8E4DC] border-[#4F8EF7]"
                                            : "text-[#7A9AB8] border-transparent hover:bg-white/4 hover:text-[#C8D8E8]"
                                            }`}
                                    >
                                        <Icon
                                            className={`w-4 h-4 shrink-0 ${active ? "text-[#4F8EF7]" : ""}`}
                                        />
                                        {title}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}

                    <div className="pb-4 border-t border-white/6">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] text-[#7A9AB8] hover:bg-white/4 hover:text-[#C8D8E8] transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Site
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 flex flex-col bg-[#F0EDE7] min-w-0">
                {/* Top Navbar */}
                <header className="md:mt-2 md:mb-1 md:mx-1 md:mr-3 md:rounded-xl shadow-sm h-14 bg-[#FCFAFA] border-b border-[#DDD9D0] px-4 md:px-6 lg:px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu className="w-5 h-5 text-[#1A2A3E]" />
                        </button>

                        <span className="sm:text-lg md:text-xl font-semibold text-[#1A2A3E]">
                            {menuItems
                                .flatMap((s) => s.items)
                                .find((i) => i.href === pathname)?.title ?? "Admin"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1B3A8C]/10 hover:bg-[#1B3A8C]/20 text-[#1B3A8C] border border-[#1B3A8C]/30 rounded-full transition-all"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden md:block text-xs md:text-sm font-medium">{user?.name}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsOpen(false)}
                                        />
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

                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto bg-[#FCFAFA] md:my-2 md:mx-1 md:mr-3 md:rounded-xl shadow-sm">
                    {children}
                </main>
            </div>
        </div>
    );
}