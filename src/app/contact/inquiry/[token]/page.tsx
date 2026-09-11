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

function formatDate(value: string, isJapanese: boolean) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(isJapanese ? "ja-JP" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getInquiryLabel(value: string, isJapanese: boolean) {
    const labels: Record<string, string> = {
        "private-office": isJapanese ? "個室オフィス" : "Private Office",
        "virtual-office": isJapanese ? "バーチャルオフィス" : "Virtual Office",
        "co-working-space": isJapanese ? "コワーキングスペース" : "Co-Working Space",
        "meeting-room": isJapanese ? "会議室" : "Meeting Room",
        "event-space": isJapanese ? "イベントスペース" : "Event Space",
        "ocular-visit": isJapanese ? "現地見学" : "Ocular Visit",
        partnership: isJapanese ? "提携" : "Partnership",
        others: isJapanese ? "その他" : "Others",
    };
    return labels[value] ?? value;
}

function getBranchLabel(value?: string | null, isJapanese: boolean = false) {
    if (!value) return isJapanese ? "指定なし" : "Not specified";
    const labels: Record<string, string> = {
        "tower-6789": "Tower 6789",
        "insular-life": isJapanese ? "Insular Life Building" : "Insular Life Building",
        both: isJapanese ? "両方の支店" : "Both Branches",
    };
    return labels[value] ?? value;
}

export default function PublicInquiryPage() {
    const params = useParams();
    const token = params?.token as string | undefined;
    const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locale, setLocale] = useState<"en" | "ja">("en");
    const isJapanese = locale === "ja";

    useEffect(() => {
        const getStoredLocale = () => {
            const match = document.cookie.match(/(?:^|;\s*)hero_lang=([^;]+)/);
            return match?.[1] === "ja" ? "ja" : "en";
        };

        const updateLocale = (event?: Event) => {
            const detail = (event as CustomEvent<string> | undefined)?.detail;
            const nextLocale = detail === "ja" || detail === "en" ? detail : getStoredLocale();
            setLocale(nextLocale);
        };

        updateLocale();
        window.addEventListener("localeChanged", updateLocale);

        return () => window.removeEventListener("localeChanged", updateLocale);
    }, []);

    useEffect(() => {
        if (!token) {
            setError(isJapanese ? "無効なお問い合わせリンクです。" : "Invalid inquiry link.");
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
                    throw new Error(data?.message || (isJapanese ? "お問い合わせを読み込めませんでした。" : "Failed to load inquiry."));
                }

                setInquiry(data.data ?? null);
            } catch (err) {
                setError(err instanceof Error ? err.message : (isJapanese ? "お問い合わせを読み込めませんでした。" : "Failed to load inquiry."));
            } finally {
                setLoading(false);
            }
        };

        fetchInquiry();
    }, [token, isJapanese]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-[#F7F4EC] px-4 py-16`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#DCD5C6] border-t-[#A9824C]" />
                    <p className="text-xs uppercase tracking-[0.2em] text-[#5C6B7A]">
                        {isJapanese ? "お問い合わせ詳細を読み込み中..." : "Loading Inquiry Details..."}
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
                        {isJapanese ? "リンクを利用できません" : "Link unavailable"}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#5C6B7A]">
                        {error ?? (isJapanese ? "このお問い合わせリンクは無効または期限切れの可能性があります。" : "This inquiry link may be invalid or expired.")}
                    </p>
                </div>
            </div>
        );
    }

    const infoRows: Array<{ label: string; value: string }> = [
        { label: isJapanese ? "氏名" : "Name", value: inquiry.name },
        { label: isJapanese ? "メールアドレス" : "Email", value: inquiry.email },
        { label: isJapanese ? "電話番号" : "Phone", value: inquiry.phone },
        ...(inquiry.company ? [{ label: isJapanese ? "会社名" : "Company", value: inquiry.company }] : []),
        { label: isJapanese ? "お問い合わせ種別" : "Inquiry Type", value: getInquiryLabel(inquiry.inquiry_type, isJapanese) },
        { label: isJapanese ? "支店希望" : "Branch Interest", value: getBranchLabel(inquiry.dynamic_data?.branchInterest, isJapanese) },
        { label: isJapanese ? "送信日時" : "Submitted", value: formatDate(inquiry.created_at, isJapanese) },
    ];

    return (
        <div className={`min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8`}>
            <div className="mx-auto w-full max-w-3xl font-body">

                {/* Directory header band */}
                <div className="relative overflow-hidden rounded-t-sm bg-[#12203A] px-8 py-3 sm:px-10 flex justify-between items-stretch">
                    <div className="absolute inset-x-0 top-0 h-0.75 bg-[#A9824C]" />
                    <div className="relative flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <h1 className="mt-2 text-[34px] font-semibold leading-tight text-[#F7F4EC] sm:text-[40px]">
                                    {isJapanese ? "お問い合わせ内容の概要" : "Inquiry Summary"}
                                </h1>
                            </div>
                        </div>
                        <p className="mt-1 max-w-md text-sm leading-6 text-[#9FADC2]">
                            {isJapanese ? "安全な閲覧リンクで簡単に確認できるよう共有されています。" : "Shared for quick reference via a secure view link."}
                        </p>
                    </div>

                    <div className="flex items-center">
                        <Link
                            href="/admin/inquiries"
                            className="inline-flex items-center gap-2 rounded-full bg-[#A9824C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#B47F3D] focus:outline-none focus:ring-2 focus:ring-[#A9824C] focus:ring-offset-2"
                        >
                            {isJapanese ? "返信" : "Reply"}
                        </Link>
                    </div>
                </div>

                {/* Directory rows */}
                <div className="border-x border-[#DCD5C6] bg-white px-8 py-2 sm:px-10">
                    {infoRows.map((row, i) => (
                        <div
                            key={row.label}
                            className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 ${i !== infoRows.length - 1
                                    ? "border-b border-[#EDE9DD]"
                                    : ""
                                }`}
                        >
                            <span className="text-[11px] uppercase tracking-[0.18em] text-[#12203A]">
                                {row.label}
                            </span>

                            {row.label === "Phone" ? (
                                <a
                                    href={`tel:${row.value.replace(/[^\d+]/g, "")}`}
                                    className="text-right text-sm text-[#12203A] underline decoration-[#A9824C] decoration-2 underline-offset-4 transition hover:text-[#A9824C] md:text-base"
                                    aria-label={`Call ${row.value}`}
                                >
                                    {row.value}
                                </a>
                            ) : row.label === "Email" ? (
                                <a
                                    href={`mailto:${row.value}`}
                                    className="text-right text-sm text-[#12203A] underline decoration-[#A9824C] decoration-2 underline-offset-4 transition hover:text-[#A9824C] md:text-base"
                                >
                                    {row.value}
                                </a>
                            ) : (
                                <span className="text-right text-sm text-[#12203A] md:text-base">
                                    {row.value}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Message */}
                <div className="border-x border-t border-[#DCD5C6] bg-white px-8 py-8 sm:px-10">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#12203A]">
                        {isJapanese ? "メッセージ" : "Message"}
                    </p>
                    <div className="mt-3 border-l-2 border-[#12203A] pl-5">
                        <p className="whitespace-pre-wrap text-sm md:text-md leading-7 text-[#2A3547]">
                            {inquiry.message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}