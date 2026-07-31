import { NextRequest, NextResponse } from "next/server";
import { sendQuotationContractEmail, QuotationPayload } from "@/lib/nodemailer";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000/api";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const quoteRes = await fetch(`${LARAVEL_API_URL}/quotations/${id}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!quoteRes.ok) {
            const text = await quoteRes.text().catch(() => "");
            return NextResponse.json({ message: `Quotation service error: ${quoteRes.status}`, error: text }, { status: quoteRes.status });
        }

        const quotePayload = await quoteRes.json().catch(() => null);
        const quotation = (quotePayload?.data ?? quotePayload) as QuotationPayload & { id?: number | string };

        if (!quotation?.detail?.email) {
            return NextResponse.json({ message: "Quotation has no client email address." }, { status: 400 });
        }

        await sendQuotationContractEmail(quotation, {});

        return NextResponse.json({ message: "Contract email sent." });
    } catch (error) {
        console.error("send-contract proxy error:", error);
        return NextResponse.json({ message: "Unable to send contract email.", error: String(error) }, { status: 502 });
    }
}
