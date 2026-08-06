import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
const LARAVEL_API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const targetUrl = `${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}/send-payment-link`;
        const localRouteUrl = `${request.nextUrl.origin.replace(/\/+$/g, "")}/api/quotations/${encodeURIComponent(id)}/send-payment-link`;

        if (targetUrl === localRouteUrl) {
            return NextResponse.json(
                { message: "Server configuration error. Set LARAVEL_API_URL to your Laravel backend URL." },
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

        const responseText = await res.text();
        let responseJson: unknown = null;
        try {
            responseJson = responseText ? JSON.parse(responseText) : null;
        } catch {
            responseJson = null;
        }

        const parsed = responseJson as { warning?: string; error?: string; message?: string } | null;
        if (res.ok && parsed && (parsed.warning || parsed.error)) {
            return NextResponse.json(
                {
                    message: parsed.warning || parsed.message || "Payment link created but email delivery failed.",
                    error: parsed.error,
                    raw: parsed,
                },
                { status: 502 }
            );
        }

        return new NextResponse(responseText || JSON.stringify(responseJson ?? {}), {
            status: res.status,
            headers: {
                "content-type": res.headers.get("content-type") ?? "application/json",
            },
        });
    } catch (error) {
        console.error("send-payment-link proxy error:", error);
        return NextResponse.json(
            { message: "Unable to send payment link.", error: String(error) },
            { status: 502 }
        );
    }
}
