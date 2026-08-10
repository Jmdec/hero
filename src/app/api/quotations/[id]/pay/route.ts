import { NextRequest, NextResponse } from "next/server";
import { QuotationDocumentCopy, QuotationPayload, sendQuotationPaymentVerificationEmail } from "@/lib/nodemailer";

const API_URL = (process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/g, "");
const LARAVEL_API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

function isLocalhostUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

function resolvePublicBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const forwardedOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : null;

  const candidates = [
    forwardedOrigin,
    request.nextUrl.origin,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    "http://localhost:3000",
  ].filter((value): value is string => Boolean(value));

  const isProd = process.env.NODE_ENV === "production";
  for (const candidate of candidates) {
    const normalized = candidate.replace(/\/+$/g, "");
    if (!/^https?:\/\//i.test(normalized)) continue;
    if (isProd && isLocalhostUrl(normalized)) continue;
    return normalized;
  }

  return "http://localhost:3000";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const appBaseUrl = resolvePublicBaseUrl(request);

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
            const verifyPaymentUrl = `${appBaseUrl.replace(/\/+$/g, "")}/api/quotations/${encodeURIComponent(id)}/payment-approved?source=payment-verification`;
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
