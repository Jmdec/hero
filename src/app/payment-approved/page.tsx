"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentApprovedPage() {
  const searchParams = useSearchParams();
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quotationId = useMemo(
    () => searchParams.get("id") || searchParams.get("quotation") || "",
    [searchParams]
  );

  const handleNotifyAdmins = async () => {
    if (!quotationId) {
      setError("Quotation reference is missing.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/quotations/${encodeURIComponent(quotationId)}/notify-payment-approved`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to notify the admins.");
      }

      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#f4f7fb] flex items-center justify-center py-6">
      <div className="max-w-xl w-full rounded-3xl border border-[#D9E2F0] bg-white shadow-[0_20px_60px_rgba(11,31,74,0.10)] overflow-hidden">
        <div className="bg-[#0B1F4A] px-8 py-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 border border-green-400/30 mb-4">
            <span className="text-3xl" aria-hidden="true">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Payment Approved</h1>
        </div>

        <div className="p-8">
          <p className="text-base leading-7 text-[#475569]">
            The payment has been approved and confirmed. You can now notify the admin team and recipients to proceed with the quotation follow-up.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isSent && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Admin and recipient notifications were sent successfully.
            </div>
          )}

          <button
            type="button"
            onClick={handleNotifyAdmins}
            disabled={isSending || !quotationId}
            className="mt-8 w-full rounded-xl bg-[#0D47A1] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B3B8A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Sending notifications..." : "Email Notify Admin & Recipients"}
          </button>

          <a
            href="/admin/quotation"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#D9E2F0] bg-[#F8FAFD] px-5 py-3 text-sm font-semibold text-[#0B1F4A] transition hover:bg-[#EEF4FF]"
          >
            Go to Quotation Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
