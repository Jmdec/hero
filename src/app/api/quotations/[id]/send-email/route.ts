import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
async function readBackendPayload(response: Response) {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();
    return { message: text || "Unexpected backend response." };
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const targetUrl = `${API_URL}/quotations/${encodeURIComponent(id)}/send-email`;
        const localRouteUrl = `${request.nextUrl.origin.replace(/\/+$/g, "")}/api/quotations/${encodeURIComponent(id)}/send-email`;

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
            body: await request.text(),
        });

        const responseJson = await readBackendPayload(res);

        return NextResponse.json(responseJson ?? {}, { status: res.status });
    } catch (error) {
        console.error("send-email proxy error:", error);
        return NextResponse.json({ message: "Unable to send email.", error: String(error) }, { status: 502 });
    }
}
