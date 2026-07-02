"use client";

import { motion } from "framer-motion";
import { Wrench, Mail, Phone } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center space-y-8"
            >
                {/* Icon */}
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF2FB] border border-[#C5D2EC]">
                    <Wrench className="h-9 w-9 text-[#1B3A8C]" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#F5F5F3] animate-pulse" />
                </div>

                {/* Copy */}
                <div>
                    <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#1B3A8C]">
                        Scheduled Maintenance
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">We&apos;ll be right back</h1>
                    <p className="mt-3 text-gray-600 leading-relaxed">
                        HERO Serviced Office is undergoing scheduled maintenance to improve your experience.
                        We appreciate your patience and expect to be back online shortly.
                    </p>
                </div>

                {/* Contact fallback */}
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 space-y-3 text-left">
                    <p className="text-xs font-semibold tracking-wide uppercase text-gray-400">
                        Need us urgently?
                    </p>
                    <a
                        href="mailto:sales@heroph.net"
                        className="flex items-center gap-2 text-sm text-[#1B3A8C] hover:text-[#3B5EA6] transition-colors"
                    >
                        <Mail className="w-4 h-4" />
                        sales@heroph.net
                    </a>
                    <a
                        href="tel:+63-(0)2-8801-3417"
                        className="flex items-center gap-2 text-sm text-[#1B3A8C] hover:text-[#3B5EA6] transition-colors"
                    >
                        <Phone className="w-4 h-4" />
                        +63-(0)2-8801-3417
                    </a>
                </div>
            </motion.div>
        </div>
    );
}