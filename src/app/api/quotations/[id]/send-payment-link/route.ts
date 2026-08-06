import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

const LARAVEL_API_BASE = API_URL.endsWith("/api")
    ? API_URL
    : `${API_URL}/api`;

async function parseJsonSafely(response: Response) {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function sendPaymentLinkEmailFallback(request: NextRequest, id: string, backendPayload: any) {
    const quotationRes = await fetch(
        `${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            cache: "no-store",
        }
    );

    if (!quotationRes.ok) {
        const payload = await parseJsonSafely(quotationRes);
        throw new Error(
            payload?.message || `Unable to load quotation data for fallback email (${quotationRes.status}).`
        );
    }

    const quotationPayload = await parseJsonSafely(quotationRes);
    const quotation = quotationPayload?.data ?? quotationPayload;

    if (!quotation?.detail?.email) {
        throw new Error("Quotation has no client email address.");
    }

    const token = backendPayload?.token ?? quotation?.detail?.payment_token;
    if (!token) {
        throw new Error("Missing payment token for fallback email delivery.");
    }

    const quotationReference = quotation?.quotation_id ?? quotation?.id ?? id;
    const publicBaseUrl = (
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.APP_URL ||
        request.nextUrl.origin
    ).replace(/\/+$/g, "");

    const paymentUrl =
        `${publicBaseUrl}/quotation/payment?quotation=${encodeURIComponent(String(quotationReference))}&token=${encodeURIComponent(String(token))}`;

    const emailRes = await fetch(
        `${request.nextUrl.origin.replace(/\/+$/g, "")}/api/quotations/${encodeURIComponent(id)}/send-payment-link-email`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quotation,
                payment_url: paymentUrl,
                recipient_email: quotation.detail.email,
                expires_in_days: 3,
            }),
        }
    );

    if (!emailRes.ok) {
        const payload = await parseJsonSafely(emailRes);
        throw new Error(payload?.message || `Fallback email delivery failed (${emailRes.status}).`);
    }

    return { paymentUrl };
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const targetUrl =
            `${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}/send-payment-link`;

        const localRouteUrl =
            `${request.nextUrl.origin.replace(/\/+$/g, "")}/api/quotations/${encodeURIComponent(id)}/send-payment-link`;

        if (targetUrl === localRouteUrl) {
            console.error("Recursive API call detected.");

            return NextResponse.json(
                {
                    message:
                        "Server configuration error. Set LARAVEL_API_URL to your Laravel backend URL.",
                },
                { status: 500 }
            );
        }

        const res = await fetch(targetUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        console.log("Laravel Response Status:", res.status);
        console.log("Laravel Response OK:", res.ok);

        const responseJson: any = await parseJsonSafely(res);

        console.log("Parsed Response:");
        console.dir(responseJson, { depth: null });

        if (!res.ok) {
            console.error("Laravel returned an error.");

            return NextResponse.json(
                {
                    message:
                        responseJson?.message ||
                        "Laravel failed to send the payment link.",
                    error: responseJson,
                },
                { status: res.status }
            );
        }

        if (
            responseJson &&
            (
                responseJson.warning ||
                responseJson.error
            )
        ) {
            console.warn("Email notification warning:");
            console.dir(responseJson, { depth: null });

            try {
                const fallback = await sendPaymentLinkEmailFallback(request, id, responseJson);

                return NextResponse.json({
                    ...responseJson,
                    success: true,
                    message: "Payment link sent using frontend fallback delivery.",
                    fallback_delivery: "frontend",
                    payment_url: fallback.paymentUrl,
                });
            } catch (fallbackError) {
                console.error("Fallback payment-link email delivery failed:", fallbackError);

                return NextResponse.json(
                    {
                        message:
                            responseJson.warning ||
                            responseJson.message ||
                            "Payment link created but email delivery failed.",
                        error: responseJson.error,
                        fallback_error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
                        raw: responseJson,
                    },
                    { status: 502 }
                );
            }
        }

        console.log("Payment link sent successfully.");

        return NextResponse.json(responseJson ?? {
            success: true,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Unable to send payment link.",
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            { status: 502 }
        );
    }
}