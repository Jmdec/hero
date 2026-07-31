import { NextRequest, NextResponse } from "next/server";
import {
    sendQuotationNotifications,
    QuotationDocumentCopy,
    QuotationPayload,
} from "@/lib/nodemailer";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000/api";
const LARAVEL_BASE_URL = process.env.LARAVEL_APP_URL ?? LARAVEL_API_URL.replace(/\/api\/?$/, "");

function resolveLaravelFileUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    if (url.startsWith("/")) {
        return `${LARAVEL_BASE_URL}${url}`;
    }

    return `${LARAVEL_BASE_URL}/${url}`;
}

async function fetchDocumentCopyFromUrl(
    url: string | null | undefined,
    filename: string | null | undefined,
    fallbackContentType: string
): Promise<QuotationDocumentCopy | null> {
    const absoluteUrl = resolveLaravelFileUrl(url);
    if (!absoluteUrl) return null;

    try {
        const res = await fetch(absoluteUrl, {
            headers: { Accept: "*/*" },
            cache: "no-store",
        });

        if (!res.ok) {
            console.warn(`Unable to fetch file for email attachment (${res.status}): ${absoluteUrl}`);
            return null;
        }

        const bytes = await res.arrayBuffer();
        const safeName = filename?.trim() || absoluteUrl.split("/").pop() || "document";

        return {
            filename: safeName,
            content: Buffer.from(bytes),
            contentType: res.headers.get("content-type") || fallbackContentType,
        };
    } catch (error) {
        console.warn(`Error fetching file for email attachment: ${absoluteUrl}`, error);
        return null;
    }
}

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
        const laravelUrl = `${LARAVEL_API_URL}/quotations${url.search}`;
        
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
        const shouldSendFrontendEmails = request.headers.get("x-send-quotation-email") === "true";
        let notificationPayload: QuotationPayload;
        let res: Response;
        let paymentProofCopy: QuotationDocumentCopy | null = null;
        let governmentIdCopy: QuotationDocumentCopy | null = null;
        let signatoryGovernmentIdCopy: QuotationDocumentCopy | null = null;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const rawPayload = formData.get("payload");

            if (typeof rawPayload !== "string") {
                return NextResponse.json(
                    { message: "Missing payload in multipart request." },
                    { status: 400 }
                );
            }

            notificationPayload = JSON.parse(rawPayload) as QuotationPayload;

            const forwardForm = new FormData();
            forwardForm.append("payload", rawPayload);

            const paymentProof = formData.get("payment_proof");
            if (paymentProof instanceof File) {
                paymentProofCopy = await fileToDocumentCopy(paymentProof);
                forwardForm.append("payment_proof", paymentProof, paymentProof.name);
            }

            const governmentId = formData.get("government_id");
            if (governmentId instanceof File) {
                governmentIdCopy = await fileToDocumentCopy(governmentId);
                forwardForm.append("government_id", governmentId, governmentId.name);
            }

            const signatoryGovernmentId = formData.get("signatory_government_id");
            if (signatoryGovernmentId instanceof File) {
                signatoryGovernmentIdCopy = await fileToDocumentCopy(signatoryGovernmentId);
                forwardForm.append("signatory_government_id", signatoryGovernmentId, signatoryGovernmentId.name);
            }

            res = await fetch(`${LARAVEL_API_URL}/quotations`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: forwardForm,
            });
        } else {
            const body = await request.json();
            notificationPayload = body as QuotationPayload;

            res = await fetch(`${LARAVEL_API_URL}/quotations`, {
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
        const savedQuotation = (data as QuotationPayload | null) ?? notificationPayload;

        // Fallback: when in-memory multipart File copies are missing, pull the persisted
        // files from Laravel storage URLs so client/admin emails still include attachments.
        if (!paymentProofCopy) {
            paymentProofCopy = await fetchDocumentCopyFromUrl(
                savedQuotation?.detail?.receipt_url,
                savedQuotation?.detail?.receipt,
                "application/octet-stream"
            );
        }

        if (!governmentIdCopy) {
            governmentIdCopy = await fetchDocumentCopyFromUrl(
                savedQuotation?.detail?.government_id_url,
                savedQuotation?.detail?.government_id_file,
                "application/octet-stream"
            );
        }

        if (!signatoryGovernmentIdCopy) {
            signatoryGovernmentIdCopy = await fetchDocumentCopyFromUrl(
                savedQuotation?.detail?.signatory_id_url,
                savedQuotation?.detail?.signatory_id_file,
                "application/octet-stream"
            );
        }

        // Fire-and-forget — quotation is already saved, so a mail failure
        // shouldn't block the user's response. Errors are logged internally.
        if (shouldSendFrontendEmails) {
            sendQuotationNotifications(savedQuotation, {
                paymentProofCopy,
                governmentIdCopy,
                signatoryGovernmentIdCopy,
            }).catch((err) => {
                console.error("Quotation email notification error:", err);
            });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Quotations POST API error:", error);
        return NextResponse.json(
            { message: "Unable to reach the quotation service. Please try again.", error: String(error) },
            { status: 502 }
        );
    }
}