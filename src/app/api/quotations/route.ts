import { NextRequest, NextResponse } from "next/server";
import {
    sendQuotationNotifications,
    QuotationDocumentCopy,
    QuotationPayload,
} from "@/lib/nodemailer";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000").replace(/\/+$/g, "");
const LARAVEL_API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

async function fileToDocumentCopy(file: File | null): Promise<QuotationDocumentCopy | null> {
    if (!file) return null;

    const bytes = await file.arrayBuffer();
    return {
        filename: file.name,
        content: Buffer.from(bytes),
        contentType: file.type || "application/octet-stream",
    };
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const laravelUrl = `${LARAVEL_API_BASE}/quotations${url.search}`;
        
        const res = await fetch(laravelUrl, {
            method: "GET",
            headers: { 
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error(`Laravel API error (${res.status}):`, text);
            return NextResponse.json(
                { message: `Quotation service error: ${res.status}`, error: text },
                { status: res.status }
            );
        }

        const data = await res.json().catch(() => null);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Quotations API error:", error);
        return NextResponse.json(
            { message: "Unable to reach the quotation service. Please try again.", error: String(error) },
            { status: 502 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get("content-type") ?? "";
        let res: Response;
        let paymentProofCopy: QuotationDocumentCopy | null = null;
        let governmentIdCopy: QuotationDocumentCopy | null = null;
        let signatoryGovernmentIdCopy: QuotationDocumentCopy | null = null;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const backendFormData = new FormData();

            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    if (key === "payment_proof") paymentProofCopy = await fileToDocumentCopy(value);
                    if (key === "government_id") governmentIdCopy = await fileToDocumentCopy(value);
                    if (key === "signatory_government_id") signatoryGovernmentIdCopy = await fileToDocumentCopy(value);
                    backendFormData.append(key, value, value.name);
                } else {
                    backendFormData.append(key, value);
                }
            }

            res = await fetch(`${LARAVEL_API_BASE}/quotations`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: backendFormData,
            });
        } else {
            const body = await request.json();

            res = await fetch(`${LARAVEL_API_BASE}/quotations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(body),
            });
        }

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error(`Laravel API error (${res.status}):`, text);
            return NextResponse.json(
                { message: `Quotation service error: ${res.status}`, error: text },
                { status: res.status }
            );
        }

        const data = await res.json().catch(() => null);
        const savedQuotation = ((data && typeof data === "object" && "data" in data)
            ? (data as any).data
            : data) as (QuotationPayload & { id?: number | string }) | null;

        let notificationResult: { userSent: boolean; adminSent: boolean } | null = null;

        // Await notification sending so serverless runtimes do not terminate
        // before the mail operation completes.
        if (savedQuotation) {
            try {
                notificationResult = await sendQuotationNotifications(savedQuotation, {
                    paymentProofCopy,
                    governmentIdCopy,
                    signatoryGovernmentIdCopy,
                    useBackendDelivery: false,
                });

                console.log("Quotation notifications dispatched", {
                    quotationId: savedQuotation.id ?? null,
                    service: savedQuotation.service_name,
                    userSent: notificationResult.userSent,
                    adminSent: notificationResult.adminSent,
                });
            } catch (err) {
                console.error("Quotation email notification error:", {
                    quotationId: savedQuotation.id ?? null,
                    service: savedQuotation.service_name,
                    error: String(err),
                });
            }
        }

        if (notificationResult && (!notificationResult.adminSent || !notificationResult.userSent)) {
            return NextResponse.json(
                {
                    ...data,
                    notification: {
                        ...notificationResult,
                        warning: "Quotation saved but one or more notification emails failed.",
                    },
                },
                { status: 201 }
            );
        }

        return NextResponse.json(
            {
                ...data,
                notification: notificationResult,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Quotations POST API error:", error);
        return NextResponse.json(
            { message: "Unable to reach the quotation service. Please try again.", error: String(error) },
            { status: 502 }
        );
    }
}