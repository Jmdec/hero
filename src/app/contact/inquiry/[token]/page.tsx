"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ContactInquiry {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string | null;
    inquiry_type: string;
    message: string;
    dynamic_data: Record<string, string> | null;
    status: string;
    thread: Array<{
        type: "inbound" | "outbound";
        from: string;
        subject: string;
        body: string;
        created_at: string;
    }>;
    last_replied_at: string | null;
    created_at: string;
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getInquiryLabel(value: string) {
    const labels: Record<string, string> = {
        "private-office": "Private Office",
        "virtual-office": "Virtual Office",
        "co-working-space": "Co-Working Space",
        "meeting-room": "Meeting Room",
        "event-space": "Event Space",
        "ocular-visit": "Ocular Visit",
        partnership: "Partnership",
        others: "Others",
    };

    return labels[value] ?? value;
}

function getBranchLabel(value?: string | null) {
    if (!value) return "Not specified";
    const labels: Record<string, string> = {
        "tower-6789": "Tower 6789",
        "insular-life": "Insular Life Building",
        both: "Both Branches",
    };
    return labels[value] ?? value;
}

export default function PublicInquiryPage() {
    const params = useParams();
    const token = params?.token as string | undefined;
    const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("Invalid inquiry link.");
            setLoading(false);
            return;
        }

        const fetchInquiry = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/contact/public/${encodeURIComponent(token)}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.message || "Failed to load inquiry.");
                }

                setInquiry(data.data ?? null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load inquiry.");
            } finally {
                setLoading(false);
            }
        };

        fetchInquiry();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
                <div className="rounded-3xl border border-gray-200 bg-white px-8 py-12 text-center shadow-lg">
                    <p className="text-gray-500">Loading inquiry details…</p>
                </div>
            </div>
        );
    }

    if (error || !inquiry) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
                <div className="rounded-3xl border border-red-200 bg-white px-8 py-12 text-center shadow-lg">
                    <p className="text-xl font-semibold text-red-700">Unable to load inquiry</p>
                    <p className="mt-3 text-sm text-slate-600">{error ?? "This inquiry link may be invalid or expired."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-4xl">
                <div className="rounded-[40px] border border-slate-200 bg-white p-10 shadow-[0_40px_120px_rgba(15,23,42,0.06)] space-y-4">
                    <div className="rounded-3xl border border-blue-50 bg-linear-to-r from-sky-50 to-white p-8 shadow-sm">
                        <h1 className="text-3xl font-bold text-slate-900">Inquiry Summary</h1>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            This inquiry is available via a secure view link for quick reference.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <section className="space-y-6 rounded-[32px] border border-slate-200 bg-slate-50 p-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Customer Information</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                                <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-3 shadow-sm">
                                    <span className="font-bold text-slate-600">Name</span>
                                    <span className="text-slate-900">{inquiry.name}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-3 shadow-sm">
                                    <span className="font-bold text-slate-600">Email</span>
                                    <span className="text-slate-900">{inquiry.email}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-3 shadow-sm">
                                    <span className="font-bold text-slate-600">Phone</span>
                                    <span className="text-slate-900">{inquiry.phone}</span>
                                </div>
                                {inquiry.company && (
                                    <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-3 shadow-sm">
                                        <span className="font-bold text-slate-600">Company</span>
                                        <span className="text-slate-900">{inquiry.company}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-3 shadow-sm">
                                    <span className="font-bold text-slate-600">Inquiry Type</span>
                                    <span className="text-slate-900">{getInquiryLabel(inquiry.inquiry_type)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-3 shadow-sm">
                                    <span className="font-bold text-slate-600">Branch Interest</span>
                                    <span className="text-slate-900">{getBranchLabel(inquiry.dynamic_data?.branchInterest)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-3 shadow-sm">
                                    <span className="font-bold text-slate-600">Submitted</span>
                                    <span className="text-slate-900">{formatDate(inquiry.created_at)}</span>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[32px] border border-slate-200 bg-linear-to-b from-[#f8fafc] to-white p-8 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Message</h2>
                                </div>
                            </div>
                            <div className="mt-2 rounded-3xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-800 shadow-sm whitespace-pre-wrap">
                                {inquiry.message}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
