"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Missing unsubscribe token.");
      setLoading(false);
      return;
    }

    async function unsubscribe() {
      try {
        const res = await fetch("/api/newsletter/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Unable to unsubscribe.");
        } else {
          setStatus(data.message || "You have been unsubscribed.");
        }
      } catch {
        setError("Unable to unsubscribe right now.");
      } finally {
        setLoading(false);
      }
    }

    void unsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Newsletter unsubscribe</h1>
        <p className="mt-4 text-sm text-slate-600">
          {loading ? "Processing your request..." : error ?? status}
        </p>
      </div>
    </div>
  );
}
