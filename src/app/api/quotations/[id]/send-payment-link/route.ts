import { NextRequest, NextResponse } from "next/server";

const API_URL = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
).replace(/\/+$/g, "");

const LARAVEL_API_BASE = API_URL.endsWith("/api")
    ? API_URL
    : `${API_URL}/api`;

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

        console.log("========================================");
        console.log("SEND PAYMENT LINK");
        console.log("========================================");
        console.log("Quotation ID:", id);
        console.log("Laravel URL:", targetUrl);

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

        const responseText = await res.text();

        console.log("Laravel Raw Response:");
        console.log(responseText);

        let responseJson: any = null;

        try {
            responseJson = responseText
                ? JSON.parse(responseText)
                : null;
        } catch (err) {
            console.warn("Laravel response is not valid JSON.");
        }

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

            return NextResponse.json(
                {
                    message:
                        responseJson.warning ||
                        responseJson.message,
                    error: responseJson.error,
                    raw: responseJson,
                },
                { status: 502 }
            );
        }

        console.log("Payment link sent successfully.");

        return NextResponse.json(responseJson ?? {
            success: true,
        });

    } catch (error) {
        console.error("========================================");
        console.error("SEND PAYMENT LINK ERROR");
        console.error("========================================");
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