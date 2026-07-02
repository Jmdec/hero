import { NextResponse } from "next/server";
import { sendQuotationNotifications, QuotationPayload } from "@/lib/nodemailer";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { quotation, quotationId } = body as {
            quotation: QuotationPayload;
            quotationId?: string | number;
        };

        if (!quotation?.detail?.email) {
            return NextResponse.json(
                { success: false, message: "Missing quotation.detail.email in request body." },
                { status: 400 }
            );
        }

        const { userSent, adminSent } = await sendQuotationNotifications(quotation, quotationId);

        return NextResponse.json(
            { success: userSent || adminSent, userEmailSent: userSent, adminEmailSent: adminSent },
            { status: userSent && adminSent ? 200 : 207 }
        );
    } catch (error) {
        console.error("Quotation email route error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to send quotation emails.", error: String(error) },
            { status: 500 }
        );
    }
}