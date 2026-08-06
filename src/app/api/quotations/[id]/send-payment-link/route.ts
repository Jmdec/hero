import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const targetUrl = `${API_URL}/quotations/${encodeURIComponent(id)}/send-payment-link`;
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
