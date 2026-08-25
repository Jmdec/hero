import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://localhost:8000").replace(/\/+$/g, "");
const LARAVEL_API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; document: string; type: string }> }
) {
    const { id, document, type } = await params;
    const authorization = request.headers.get("authorization");

    try {
        const response = await fetch(
            `${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}/documents/${encodeURIComponent(document)}/${encodeURIComponent(type)}`,
            {
                headers: {
                    Accept: "*/*",
                    ...(authorization ? { Authorization: authorization } : {}),
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            return NextResponse.json({ message: "Document not found." }, { status: response.status });
        }

        return new NextResponse(await response.arrayBuffer(), {
            status: 200,
            headers: {
                "Content-Type": response.headers.get("content-type") || "application/octet-stream",
                "Content-Disposition": response.headers.get("content-disposition") || "inline",
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "private, no-store",
            },
        });
    } catch {
        return NextResponse.json({ message: "Unable to retrieve document." }, { status: 502 });
    }
}
