import { NextRequest, NextResponse } from "next/server";
import { QuotationDocumentCopy, QuotationPayload, sendQuotationPaymentVerificationEmail } from "@/lib/nodemailer";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
const LARAVEL_API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const formData = await request.formData();
    const backendFormData = new FormData();
    let paymentProofCopy: QuotationDocumentCopy | null = null;

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        backendFormData.append(key, value, value.name);
        if (key === "payment_proof") {
          const bytes = await value.arrayBuffer();
          paymentProofCopy = {
            filename: value.name,
            content: Buffer.from(bytes),
            contentType: value.type || "application/octet-stream",
          };
        }
      } else {
        backendFormData.append(key, value);
      }
    }

    const res = await fetch(`${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}/pay`, {
      method: "POST",
      body: backendFormData,
      cache: "no-store",
    });

    const responseText = await res.text();

    let responseJson: unknown = null;
    try {
      responseJson = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseJson = null;
    }

    if (res.ok) {
      try {
        const quoteRes = await fetch(`${LARAVEL_API_BASE}/quotations/${encodeURIComponent(id)}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (quoteRes.ok) {
          const quotePayload = await quoteRes.json().catch(() => null);
          const quotation = (quotePayload?.data ?? quotePayload) as (QuotationPayload & { id?: string | number }) | null;

          if (quotation) {
            const verifyPaymentUrl = `${LARAVEL_API_BASE}/api/quotations/${encodeURIComponent(id)}/payment-approved?source=payment-verification`;
            await sendQuotationPaymentVerificationEmail(quotation, {
              paymentProofCopy,
              verifyPaymentUrl,
            });
          }
        }
      } catch (emailError) {
        console.error("Payment verification email error:", emailError);
      }
    }

    return new NextResponse(responseText || JSON.stringify(responseJson ?? {}), {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Quotation pay proxy error:", error);
    return NextResponse.json(
      { message: "Unable to submit payment." , error: String(error) },
      { status: 502 }
    );
  }
}
