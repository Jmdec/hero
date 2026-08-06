import { NextRequest, NextResponse } from "next/server";
const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const res = await fetch(`${API_URL}/quotations/${id}/send-email`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: await request.text(),
        });

        const responseBody = await res.text();
        const responseJson = responseBody ? JSON.parse(responseBody) : null;

        return NextResponse.json(responseJson ?? {}, { status: res.status });
    } catch (error) {
        console.error("send-email proxy error:", error);
        return NextResponse.json({ message: "Unable to send email.", error: String(error) }, { status: 502 });
    }
}
