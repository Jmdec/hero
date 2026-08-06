import { NextRequest, NextResponse } from "next/server";
import { QuotationPayload, sendQuotationPaymentVerifiedAdminEmail } from "@/lib/nodemailer";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000/api";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const quoteRes = await fetch(`${LARAVEL_API_URL}/quotations/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!quoteRes.ok) {
      const text = await quoteRes.text().catch(() => "");
      return NextResponse.json(
        { message: `Quotation service error: ${quoteRes.status}`, error: text },
        { status: quoteRes.status }
      );
    }

    const quotePayload = await quoteRes.json().catch(() => null);
    const quotation = (quotePayload?.data ?? quotePayload) as (QuotationPayload & { id?: number | string }) | null;

    if (!quotation) {
      return NextResponse.json({ message: "Quotation not found." }, { status: 404 });
    }

    const finalQuotation = {
      ...quotation,
      id: quotation.id ?? id,
      status: "paid",
    } as QuotationPayload & { id?: number | string };

    await sendQuotationPaymentVerifiedAdminEmail(finalQuotation, {});

    return NextResponse.json({
      success: true,
      message: "Admin and recipient notifications sent.",
    });
  } catch (error) {
    console.error("notify-payment-approved proxy error:", error);
    return NextResponse.json(
      { message: "Unable to notify admins.", error: String(error) },
      { status: 502 }
    );
  }
}
