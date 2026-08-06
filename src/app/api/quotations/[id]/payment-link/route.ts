import { NextRequest, NextResponse } from "next/server";
const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000/api";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const url = new URL(request.url);
        const queryString = url.search;
        const res = await fetch(`${LARAVEL_API_URL}/quotations/${id}/payment-link${queryString}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const responseBody = await res.text();
        const responseJson = responseBody ? JSON.parse(responseBody) : null;

        return NextResponse.json(responseJson ?? {}, { status: res.status });
    } catch (error) {
        console.error("payment-link proxy error:", error);
        return NextResponse.json({ message: "Unable to validate payment link.", error: String(error) }, { status: 502 });
    }
}
