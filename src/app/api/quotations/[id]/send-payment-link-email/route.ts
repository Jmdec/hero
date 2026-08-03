import { NextRequest, NextResponse } from "next/server";
import { sendQuotationPaymentLinkEmail } from "../../../../../lib/nodemailer";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();

        const quotation = payload?.quotation;
        const paymentUrl = payload?.payment_url;
        const recipientEmail = payload?.recipient_email;
        const expiresInDays = payload?.expires_in_days ?? 3;

        if (!quotation || !paymentUrl) {
            return NextResponse.json({ message: "Missing quotation or payment URL." }, { status: 400 });
        }

        const normalizedQuotation = {
            ...quotation,
            detail: {
                ...quotation.detail,
                email: recipientEmail || quotation.detail?.email || "",
            },
        };

        await sendQuotationPaymentLinkEmail(normalizedQuotation, paymentUrl, { expiresInDays });

        return NextResponse.json({
            success: true,
            message: `Payment link email sent for quotation ${id}`,
        });
    } catch (error) {
        console.error("send-payment-link-email proxy error:", error);
        return NextResponse.json(
            { message: "Unable to send payment link email.", error: String(error) },
            { status: 500 }
        );
    }
}
