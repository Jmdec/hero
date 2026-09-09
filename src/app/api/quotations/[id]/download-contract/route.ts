import { NextResponse } from "next/server";
import { generateDocumentPdf, QuotationPayload } from "@/lib/nodemailer";
import { getDocumentFilename, getQuotationDocumentType } from "@/lib/documentType";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
const LARAVEL_API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const quoteResponse = await fetch(`${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });

        if (!quoteResponse.ok) {
            const text = await quoteResponse.text().catch(() => "");
            return NextResponse.json(
                { message: `Quotation service error: ${quoteResponse.status}`, error: text },
                { status: quoteResponse.status }
            );
        }

        const payload = await quoteResponse.json().catch(() => null);
        const quotation = (payload?.data ?? payload) as QuotationPayload | null;
        if (!quotation?.detail) {
            return NextResponse.json({ message: "Quotation data is unavailable." }, { status: 404 });
        }

        const pdf = await generateDocumentPdf(quotation);
        const documentType = getQuotationDocumentType(quotation);
        const filename = getDocumentFilename(quotation, documentType);

        return new NextResponse(new Uint8Array(pdf), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Contract download error:", error);
        return NextResponse.json(
            { message: "Unable to generate the contract PDF.", error: String(error) },
            { status: 502 }
        );
    }
}
