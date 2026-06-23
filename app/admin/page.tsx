"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";

export default function AdminDashboard() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    };

    return (
        <>
            <section className="px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h3 className="text-gray-500">Users</h3>
                        <p className="text-3xl font-bold">250</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h3 className="text-gray-500">Inquiries</h3>
                        <p className="text-3xl font-bold">34</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h3 className="text-gray-500">Blogs</h3>
                        <p className="text-3xl font-bold">18</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h3 className="text-gray-500">Revenue</h3>
                        <p className="text-3xl font-bold">₱125,000</p>
                    </div>
                </div>
            </section>
        </>
    );
}
