import { NextRequest, NextResponse } from "next/server";

const API_URL = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
).replace(/\/+$/g, "");

const LARAVEL_API_BASE = API_URL.endsWith("/api")
    ? API_URL
    : `${API_URL}/api`;

async function parseJsonSafely(response: Response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return {
            raw: text,
        };
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const targetUrl =
        `${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}/send-payment-link`;

    const localRouteUrl =
        `${request.nextUrl.origin}/api/quotations/${encodeURIComponent(id)}/send-payment-link`;

    console.log("[PAYMENT LINK] Starting request");
    console.log("[PAYMENT LINK] Laravel URL:", targetUrl);
    console.log("[PAYMENT LINK] Local URL:", localRouteUrl);

    if (targetUrl === localRouteUrl) {
        console.error("[PAYMENT LINK] Recursive API call detected");

        return NextResponse.json(
            {
                message:
                    "Server configuration error. LARAVEL_API_URL is pointing to the Next.js application instead of Laravel.",
                laravel_api_url: process.env.LARAVEL_API_URL || null,
            },
            { status: 500 }
        );
    }

    try {
        const startedAt = Date.now();

        const res = await fetch(targetUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-Frontend-Origin": request.nextUrl.origin,
            },
            cache: "no-store",
        });

        const duration = Date.now() - startedAt;

        const responseJson = await parseJsonSafely(res);

        console.log("[PAYMENT LINK] Laravel response:", {
            status: res.status,
            ok: res.ok,
            duration: `${duration}ms`,
            body: responseJson,
        });

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

        return NextResponse.json(
            responseJson ?? {
                success: true,
            }
        );
    } catch (error) {
        console.error("[PAYMENT LINK] Laravel request failed:", error);

        return NextResponse.json(
            {
                message: "Unable to connect to the Laravel backend.",
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
                target_url: targetUrl,
            },
            { status: 502 }
        );
    }
}