"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Loading } from "@/components/Loading";

type Status = "loading" | "success" | "error" | "missing";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("missing");
            setMessage("No verification token was provided.");
            return;
        }

        const verify = async () => {
            try {
                const response = await fetch(
                    `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
                    { method: "GET", headers: { Accept: "application/json" } }
                );

                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus("success");
                    setMessage(data.message || "Your email has been verified successfully.");
                } else {
                    setStatus("error");
                    setMessage(data.message || "This verification link is invalid or has expired.");
                }
            } catch {
                setStatus("error");
                setMessage("Something went wrong. Please try again later.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md rounded-3xl bg-white shadow-xl border border-gray-200 overflow-hidden"
            >
                {/* Top accent bar */}
                <div className="h-0.75 bg-linear-to-r from-[#1B3A8C] via-[#3B5EA6] to-[#FFC107]" />

                <div className="p-10 text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#0D47A1] mb-8">
                        Hero Serviced Office
                    </p>

                    {/* Loading */}
                    {status === "loading" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                                <Loader2 className="h-9 w-9 text-[#0D47A1] animate-spin" />
                            </div>
                            <h1 className="text-[22px] font-medium text-gray-900">
                                Verifying your email…
                            </h1>
                            <p className="text-sm text-gray-500">
                                Please wait while we confirm your email address.
                            </p>
                        </motion.div>
                    )}

                    {/* Success */}
                    {status === "success" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border border-green-100">
                                <CheckCircle2 className="h-9 w-9 text-green-600" />
                            </div>
                            <h1 className="text-[22px] font-medium text-gray-900">
                                Email verified
                            </h1>
                            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                            <p className="text-sm text-gray-400">
                                You can now log in to your account.
                            </p>
                            <Link
                                href="/login"
                                className="mt-2 w-full rounded-xl bg-[#1B3A8C] py-3 text-sm font-medium text-white transition hover:bg-[#2a4fa8] text-center block"
                            >
                                Go to login
                            </Link>
                        </motion.div>
                    )}

                    {/* Error */}
                    {status === "error" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border border-red-100">
                                <XCircle className="h-9 w-9 text-red-500" />
                            </div>
                            <h1 className="text-[22px] font-medium text-gray-900">
                                Verification failed
                            </h1>
                            <div className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-left">
                                <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#1B3A8C]" />
                                    <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5 w-full">
                                <Link
                                    href="/login"
                                    className="w-full rounded-xl bg-[#1B3A8C] py-3 text-sm font-medium text-white transition hover:bg-[#2a4fa8] text-center block"
                                >
                                    Go to login
                                </Link>
                                <Link
                                    href="/register"
                                    className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 text-center block"
                                >
                                    Create a new account
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* Missing token */}
                    {status === "missing" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 border border-amber-100">
                                <XCircle className="h-9 w-9 text-amber-500" />
                            </div>
                            <h1 className="text-[22px] font-medium text-gray-900">
                                Invalid link
                            </h1>
                            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                            <Link
                                href="/login"
                                className="mt-2 w-full rounded-xl bg-[#1B3A8C] py-3 text-sm font-medium text-white transition hover:bg-[#2a4fa8] text-center block"
                            >
                                Back to login
                            </Link>
                        </motion.div>
                    )}
                </div>

                <div className="bg-gray-50 px-10 py-5 text-center text-xs text-gray-400 border-t border-gray-100">
                    © {new Date().getFullYear()} Hero Serviced Office. All rights reserved.
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <Loading
                    variant="screen"
                    title="Verifying your email"
                    subtitle="Hero Serviced Office"
                />
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}