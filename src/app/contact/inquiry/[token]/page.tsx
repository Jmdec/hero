"use client";

import Link from "next/link";
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
    dynamic_data?: Record<string, string> | null;
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
            <div className={`min-h-screen flex items-center justify-center bg-[#F7F4EC] px-4 py-16`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DCD5C6] border-t-[#A9824C]" />
                    <p className="text-xs uppercase tracking-[0.2em] text-[#5C6B7A]">
                        Loading Inquiry Details...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !inquiry) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-[#F7F4EC] px-4 py-16`}>
                <div className="w-full max-w-md border border-[#DCD5C6] bg-white p-10 text-center">
                    <div className="mx-auto mb-4 h-px w-10 bg-[#B4433B]" />
                    <p className="text-2xl font-semibold text-[#12203A]">
                        Link unavailable
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#5C6B7A]">
                        {error ?? "This inquiry link may be invalid or expired."}
                    </p>
                </div>
            </div>
        );
    }

    const infoRows: Array<{ label: string; value: string }> = [
        { label: "Name", value: inquiry.name },
        { label: "Email", value: inquiry.email },
        { label: "Phone", value: inquiry.phone },
        ...(inquiry.company ? [{ label: "Company", value: inquiry.company }] : []),
        { label: "Inquiry Type", value: getInquiryLabel(inquiry.inquiry_type) },
        { label: "Branch Interest", value: getBranchLabel(inquiry.dynamic_data?.branchInterest) },
        { label: "Submitted", value: formatDate(inquiry.created_at) },
    ];

    return (
        <div className={`min-h-screen bg-[#F7F4EC] px-4 py-10 sm:px-6 lg:px-8`}>
            <div className="mx-auto w-full max-w-3xl font-body">

                {/* Directory header band */}
                <div className="relative overflow-hidden rounded-t-sm bg-[#12203A] px-8 py-3 sm:px-10 flex justify-between items-stretch">
                    <div className="absolute inset-x-0 top-0 h-0.75 bg-[#A9824C]" />
                    <div className="relative flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <h1 className="mt-2 text-[34px] font-semibold leading-tight text-[#F7F4EC] sm:text-[40px]">
                                    Inquiry Summary
                                </h1>
                            </div>
                        </div>
                        <p className="mt-1 max-w-md text-sm leading-6 text-[#9FADC2]">
                            Shared for quick reference via a secure view link.
                        </p>
                    </div>

                    <div className="flex items-center">
                        <Link
                            href="/admin/inquiries"
                            className="inline-flex items-center gap-2 rounded-full bg-[#A9824C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#B47F3D] focus:outline-none focus:ring-2 focus:ring-[#A9824C] focus:ring-offset-2"
                        >
                            Reply
                        </Link>
                    </div>
                </div>

                {/* Directory rows */}
                <div className="border-x border-[#DCD5C6] bg-white px-8 py-2 sm:px-10">
                    {infoRows.map((row, i) => (
                        <div
                            key={row.label}
                            className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 ${i !== infoRows.length - 1 ? "border-b border-[#EDE9DD]" : ""
                                }`}
                        >
                            <span className="text-[11px] uppercase tracking-[0.18em] text-[#A9824C]/60">
                                {row.label}
                            </span>
                            <span className="text-right text-sm md:text-md text-[#12203A]">
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Message */}
                <div className="border-x border-t border-[#DCD5C6] bg-white px-8 py-8 sm:px-10">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#A9824C]">
                        Message
                    </p>
                    <div className="mt-3 border-l-2 border-[#A9824C] pl-5">
                        <p className="whitespace-pre-wrap text-sm md:text-md leading-7 text-[#2A3547]">
                            {inquiry.message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}