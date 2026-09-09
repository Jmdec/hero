import { NextRequest, NextResponse } from "next/server";

const configuredApiUrl = process.env.LARAVEL_API_URL?.trim();
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?\/?$/i.test(
    configuredApiUrl ?? "",
);
const API_URL = (
    process.env.NODE_ENV === "production" && isLocalApiUrl
        ? "https://infinitech-api23.site"
        : configuredApiUrl || "https://infinitech-api23.site"
).replace(/\/+$/g, "");
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
            const responseText = await response.text().catch(() => "");
            let payload: unknown = null;

            try {
                payload = responseText ? JSON.parse(responseText) : null;
            } catch {
                payload = null;
            }

            return NextResponse.json(
                payload && typeof payload === "object"
                    ? payload
                    : { message: responseText || "Unable to retrieve document." },
                { status: response.status },
            );
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
