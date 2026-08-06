import { NextRequest, NextResponse } from "next/server";
import { sendQuotationContractEmail, QuotationPayload } from "@/lib/nodemailer";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000/api";

async function sendContractForQuotation(quotation: QuotationPayload & { id?: number | string }) {
    if (!quotation?.detail?.email) {
        throw new Error("Quotation has no client email address.");
    }

    return sendQuotationContractEmail(quotation, {});
}

export async function GET(
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

        await sendContractForQuotation(quotation);

        const updateRes = await fetch(`${LARAVEL_API_URL}/quotations/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status: "contract_sent",
                detail: quotation?.detail ?? {},
            }),
        });

        if (!updateRes.ok) {
            const text = await updateRes.text().catch(() => "");
            throw new Error(`Contract status update failed: ${updateRes.status}${text ? ` - ${text}` : ""}`);
        }

        return new NextResponse(`<!doctype html><html><body style="font-family:Arial,sans-serif;padding:32px;"><h2>Contract email sent successfully.</h2><p>The contract has been sent to the client.</p></body></html>`, {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
        });
    } catch (error) {
        console.error("send-contract proxy error:", error);
        return NextResponse.json({ message: "Unable to send contract email.", error: String(error) }, { status: 502 });
    }
}

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

        await sendContractForQuotation(quotation);

        const updateRes = await fetch(`${LARAVEL_API_URL}/quotations/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status: "contract_sent",
                detail: quotation?.detail ?? {},
            }),
        });

        if (!updateRes.ok) {
            const text = await updateRes.text().catch(() => "");
            throw new Error(`Contract status update failed: ${updateRes.status}${text ? ` - ${text}` : ""}`);
        }

        return NextResponse.json({ message: "Contract email sent." });
    } catch (error) {
        console.error("send-contract proxy error:", error);
        return NextResponse.json({ message: "Unable to send contract email.", error: String(error) }, { status: 502 });
    }
}
