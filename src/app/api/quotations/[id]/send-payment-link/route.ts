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

        if (!res.ok) {
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