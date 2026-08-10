import { NextResponse } from "next/server";
import { buildResolvedQuotationContractContent, QuotationPayload } from "@/lib/nodemailer";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
const LARAVEL_API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
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
            return NextResponse.json(
                { message: `Quotation service error: ${quoteRes.status}`, error: text },
                { status: quoteRes.status }
            );
        }

        const quotePayload = await quoteRes.json().catch(() => null);
        const quotation = (quotePayload?.data ?? quotePayload) as QuotationPayload | null;

        if (!quotation || !quotation.detail) {
            return NextResponse.json({ message: "Quotation data is unavailable." }, { status: 404 });
        }

        const content = buildResolvedQuotationContractContent(quotation);
        return NextResponse.json({ content });
    } catch (error) {
        console.error("contract-content proxy error:", error);
        return NextResponse.json(
            { message: "Unable to resolve contract content.", error: String(error) },
            { status: 502 }
        );
    }
}
