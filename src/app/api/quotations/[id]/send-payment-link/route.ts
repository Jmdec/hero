import { NextRequest, NextResponse } from "next/server";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const res = await fetch(`${LARAVEL_API_URL}/quotations/${encodeURIComponent(id)}/send-payment-link`, {
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
