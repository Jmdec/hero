import { NextRequest, NextResponse } from "next/server";
import {
    sendQuotationNotifications,
    QuotationDocumentCopy,
    QuotationPayload,
} from "@/lib/nodemailer";

function resolveLaravelApiBase() {
    const configured = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
    const normalized = configured.replace(/\/+$/g, "");
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

const API_URL = resolveLaravelApiBase();

const LARAVEL_BASE_URL = process.env.LARAVEL_APP_URL ?? API_URL.replace(/\/api\/?$/, "");

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
        const laravelUrl = `${API_URL}/quotations${url.search}`;
        
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
        let notificationPayload: QuotationPayload | null = null;
        let notificationSummary: { userSent: boolean; adminSent: boolean } | null = null;
        let res: Response;
        let paymentProofCopy: QuotationDocumentCopy | null = null;
        let governmentIdCopy: QuotationDocumentCopy | null = null;
        let signatoryGovernmentIdCopy: QuotationDocumentCopy | null = null;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const backendFormData = new FormData();

            const rawPayload = formData.get("payload");
            if (typeof rawPayload === "string") {
                try {
                    notificationPayload = JSON.parse(rawPayload) as QuotationPayload;
                } catch (error) {
                    console.warn("Unable to parse multipart quotation payload for email notification context.", error);
                }
            }

            const paymentProofFile = formData.get("payment_proof");
            const governmentIdFile = formData.get("government_id");
            const signatoryGovernmentIdFile = formData.get("signatory_government_id");

            paymentProofCopy = await fileToDocumentCopy(paymentProofFile instanceof File ? paymentProofFile : null);
            governmentIdCopy = await fileToDocumentCopy(governmentIdFile instanceof File ? governmentIdFile : null);
            signatoryGovernmentIdCopy = await fileToDocumentCopy(
                signatoryGovernmentIdFile instanceof File ? signatoryGovernmentIdFile : null
            );

            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    backendFormData.append(key, value, value.name);
                } else {
                    backendFormData.append(key, value);
                }
            }

            res = await fetch(`${API_URL}/quotations`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: backendFormData,
            });
        } else {
            const body = await request.json();
            notificationPayload = body as QuotationPayload;

            res = await fetch(`${API_URL}/quotations`, {
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
        const extractedData =
            data && typeof data === "object" && "data" in data
                ? (data as { data?: unknown }).data
                : data;
        const savedQuotation = (extractedData as QuotationPayload | null) ?? (notificationPayload ?? null);

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

        // Wait for notification delivery so serverless runtimes cannot drop
        // detached promises before SMTP sends complete.
        if (savedQuotation) {
            const notificationQuotationId = (savedQuotation as QuotationPayload & { id?: number | string }).id;
            try {
                const delivery = await sendQuotationNotifications(
                    savedQuotation,
                    {
                        paymentProofCopy,
                        governmentIdCopy,
                        signatoryGovernmentIdCopy,
                    },
                );

                notificationSummary = {
                    userSent: delivery.userSent,
                    adminSent: delivery.adminSent,
                };

                if (!delivery.adminSent || !delivery.userSent) {
                    console.error("Quotation notification delivery incomplete.", {
                        quotationId: notificationQuotationId ?? null,
                        userSent: delivery.userSent,
                        adminSent: delivery.adminSent,
                    });
                }
            } catch (err) {
                notificationSummary = { userSent: false, adminSent: false };
                console.error("Quotation email notification error:", {
                    quotationId: notificationQuotationId ?? null,
                    error: err,
                });
            }
        } else {
            console.error("Quotation notification skipped because no payload could be derived after successful submission.");
        }

        const responsePayload =
            data && typeof data === "object"
                ? {
                    ...(data as Record<string, unknown>),
                    notification: notificationSummary,
                }
                : { data, notification: notificationSummary };

        return NextResponse.json(responsePayload, { status: 201 });
    } catch (error) {
        console.error("Quotations POST API error:", error);
        return NextResponse.json(
            { message: "Unable to reach the quotation service. Please try again.", error: String(error) },
            { status: 502 }
        );
    }
}