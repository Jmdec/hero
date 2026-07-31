import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendQuotationPaymentLinkEmail, QuotationPayload } from "@/lib/nodemailer";

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

        const token = randomBytes(20).toString("hex");
        const expiresInDays = 3;
        const expiresAtIso = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
        const existingDetail = quotation.detail ?? {};

        if (!existingDetail.full_name || !existingDetail.email || !existingDetail.phone) {
            return NextResponse.json(
                { message: "Quotation is missing required customer details for payment-link generation." },
                { status: 422 }
            );
        }

        const mergedDetail = {
            ...existingDetail,
            seats: existingDetail.seats ?? 1,
            date: existingDetail.date ?? new Date().toISOString().slice(0, 10),
            total: existingDetail.total ?? 0,
            payment_method: existingDetail.payment_method ?? "qrph",
            payment_token: token,
            payment_token_expires_at: expiresAtIso,
        };

        const updateRes = await fetch(`${LARAVEL_API_URL}/quotations/${id}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status: "awaiting_payment",
                detail: mergedDetail,
            }),
        });

        if (!updateRes.ok) {
            const text = await updateRes.text().catch(() => "");
            return NextResponse.json({ message: `Quotation update error: ${updateRes.status}`, error: text }, { status: updateRes.status });
        }

        const frontendBase =
            process.env.NEXT_PUBLIC_FRONTEND_URL ||
            process.env.FRONTEND_URL ||
            request.nextUrl.origin;

        const paymentUrl = `${frontendBase.replace(/\/$/, "")}/quotation/payment?quotation=${encodeURIComponent(String(id))}&token=${encodeURIComponent(token)}`;

        await sendQuotationPaymentLinkEmail(quotation, paymentUrl, { expiresInDays });

        return NextResponse.json({
            message: "Payment link sent.",
            token,
            payment_url: paymentUrl,
        });
    } catch (error) {
        console.error("send-payment-link proxy error:", error);
        return NextResponse.json({ message: "Unable to send payment link.", error: String(error) }, { status: 502 });
    }
}
