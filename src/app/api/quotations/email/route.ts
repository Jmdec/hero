import { NextResponse } from "next/server";
import { sendQuotationNotifications, QuotationPayload } from "@/lib/nodemailer";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { quotation } = body as {
            quotation: QuotationPayload;
        };

        if (!quotation?.detail?.email) {
            return NextResponse.json(
                { success: false, message: "Missing quotation.detail.email in request body." },
                { status: 400 }
            );
        }

        const { userSent, adminSent } = await sendQuotationNotifications(
            quotation,
            {},
            { disableBackendDelegation: true }
        );

        if (!userSent || !adminSent) {
            return NextResponse.json(
                {
                    success: false,
                    message: "One or more quotation notifications failed.",
                    userEmailSent: userSent,
                    adminEmailSent: adminSent,
                },
                { status: 502 }
            );
        }

        return NextResponse.json(
            { success: true, userEmailSent: true, adminEmailSent: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Quotation email route error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to send quotation emails.", error: String(error) },
            { status: 500 }
        );
    }
}