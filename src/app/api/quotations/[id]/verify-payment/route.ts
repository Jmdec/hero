import { NextRequest, NextResponse } from "next/server";
import { QuotationPayload, sendQuotationPaymentVerifiedAdminEmail } from "@/lib/nodemailer";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
const LARAVEL_API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

async function handleVerifyPayment(
    id: string
) {
    const quoteRes = await fetch(`${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!quoteRes.ok) {
        const text = await quoteRes.text().catch(() => "");
        return {
            status: quoteRes.status,
            body: NextResponse.json(
                { message: `Quotation service error: ${quoteRes.status}`, error: text },
                { status: quoteRes.status }
            ),
        };
    }

    const quotePayload = await quoteRes.json().catch(() => null);
    const quotation = (quotePayload?.data ?? quotePayload) as (QuotationPayload & {
        id?: number | string;
        paid_at?: string | null;
    }) | null;

    if (!quotation) {
        return {
            status: 404,
            body: NextResponse.json({ message: "Quotation not found." }, { status: 404 }),
        };
    }

    const updatedQuotation = {
        ...quotation,
        status: "paid",
        paid_at: new Date().toISOString(),
    };

    const updateRes = await fetch(`${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedQuotation),
    });

    if (!updateRes.ok) {
        const text = await updateRes.text().catch(() => "");
        return {
            status: updateRes.status,
            body: NextResponse.json(
                { message: `Quotation update error: ${updateRes.status}`, error: text },
                { status: updateRes.status }
            ),
        };
    }

    const updatedPayload = await updateRes.json().catch(() => updatedQuotation);
    const finalQuotation = (updatedPayload?.data ?? updatedPayload ?? updatedQuotation) as QuotationPayload & {
        id?: number | string;
        paid_at?: string | null;
    };

    try {
        await sendQuotationPaymentVerifiedAdminEmail(finalQuotation, {});
    } catch (emailError) {
        console.error("Admin payment verification notification failed:", emailError);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
    const dashboardUrl = new URL("/admin/quotation", baseUrl);
    dashboardUrl.searchParams.set("status", "paid");
    dashboardUrl.searchParams.set("search", String(id));

    return {
        status: 302,
        body: NextResponse.redirect(dashboardUrl.toString()),
    };
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const result = await handleVerifyPayment(id);
        return result.body;
    } catch (error) {
        console.error("verify-payment proxy error:", error);
        return NextResponse.json(
            { message: "Unable to verify payment.", error: String(error) },
            { status: 502 }
        );
    }
}

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const result = await handleVerifyPayment(id);
        return result.body;
    } catch (error) {
        console.error("verify-payment proxy error:", error);
        return NextResponse.json(
            { message: "Unable to verify payment.", error: String(error) },
            { status: 502 }
        );
    }
}