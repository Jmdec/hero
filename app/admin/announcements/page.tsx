"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";

export default function AnnouncementPage() {
    const router = useRouter();
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    }

    return (
        <>
            <section className="px-8">
                <div className="bg-white p-6 rounded-2xl shadow">
                    <h3 className="text-gray-500">No announcements yet.</h3>

                </div>
            </section>
        </>
    );
}