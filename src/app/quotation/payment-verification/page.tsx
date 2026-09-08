"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
	ArrowLeft,
	CheckCircle2,
	FileCheck2,
	Loader2,
	Receipt,
	UserRound,
	X,
	Eye,
	XCircle,
} from "lucide-react";

interface PaymentQuotation {
	id: number;
	quotation_id?: string | null;
	service_name: string;
	branch?: string | null;
	status: string;
	detail?: {
		full_name?: string | null;
		phone?: string | null;
		company_name?: string | null;
		email?: string | null;
		payment_method?: string | null;
		transaction_id?: string | null;
		total?: number | string | null;
		receipt?: string | null;
		receipt_url?: string | null;
		receipt_path?: string | null;
		quotation_document_id?: number | null;
		package_price?: number | string | null;
		vat_percentage?: number | string | null;
		vat_amount?: number | string | null;
		duration?: number | string | null;
		duration_type: string | null;
		months?: number | string | null;
		subtotal?: number | string | null;
		contract_admin_fee?: number | string | null;
		contract_vat?: number | string | null;
	} | null;
}

function formatValue(value?: string | number | null) {
	return value === null || value === undefined || value === ""
		? "Not provided"
		: String(value);
}

function formatAmount(value?: number | string | null) {
	if (value === null || value === undefined || value === "") {
		return "Not provided";
	}

	const amount = Number(value);

	if (!Number.isFinite(amount)) {
		return String(value);
	}

	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
	}).format(amount);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:py-3.5">
			<dt className="text-xs text-[#64748B] sm:text-sm">{label}</dt>
			<dd className="text-sm font-semibold text-[#0B1F4A] break-words sm:max-w-[60%] sm:text-right">
				{value}
			</dd>
		</div>
	);
}

function SectionCard({
	icon,
	title,
	description,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(11,31,74,0.04)]">
			<div className="border-b border-[#E8EDF4] px-4 py-4 sm:px-6">
				<div className="flex items-start gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0D47A1]">
						{icon}
					</div>

					<div className="min-w-0">
						<h2 className="text-sm font-bold text-[#0B1F4A]">{title}</h2>

						{description && (
							<p className="mt-0.5 text-xs text-[#64748B]">{description}</p>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 sm:px-6">{children}</div>
		</section>
	);
}

const isPdfMime = (mimeType: string) => mimeType === "application/pdf";
const isImageMime = (mimeType: string) => mimeType.startsWith("image/");

type ToastTone = "success" | "error";

interface ToastItem {
	id: number;
	message: string;
	tone: ToastTone;
}

function ToastStack({
	toasts,
	onDismiss,
}: {
	toasts: ToastItem[];
	onDismiss: (id: number) => void;
}) {
	if (toasts.length === 0) return null;
	return (
		<div className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2 pointer-events-none">
			{toasts.map((t) => (
				<div
					key={t.id}
					className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${t.tone === "success"
							? "bg-white border-green-200"
							: "bg-white border-red-200"
						}`}
				>
					{t.tone === "success" ? (
						<CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
					) : (
						<XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
					)}
					<p className="text-sm text-[#0B1F4A] flex-1 leading-snug">
						{t.message}
					</p>
					<button
						onClick={() => onDismiss(t.id)}
						className="text-[#64748B] hover:text-[#0B1F4A] transition shrink-0"
						aria-label="Dismiss notification"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			))}
		</div>
	);
}

export default function PaymentVerificationPage() {
	const searchParams = useSearchParams();

	const quotationId =
		searchParams.get("id") || searchParams.get("quotation") || "";

	const [quotation, setQuotation] = useState<PaymentQuotation | null>(null);
	const [loading, setLoading] = useState(Boolean(quotationId));
	const [verifying, setVerifying] = useState(false);
	const [error, setError] = useState<string | null>(
		quotationId ? null : "Quotation reference is missing."
	);
	const [receiptPreview, setReceiptPreview] = useState<{
		url: string;
		mimeType: string;
	} | null>(null);

	const [receiptLoading, setReceiptLoading] = useState(false);
	const [receiptModalOpen, setReceiptModalOpen] = useState(false);

	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const toastIdRef = useRef(0);

	const pushToast = useCallback((message: string, tone: ToastTone) => {
		const id = ++toastIdRef.current;
		setToasts((t) => [...t, { id, message, tone }]);
		setTimeout(() => {
			setToasts((t) => t.filter((toast) => toast.id !== id));
		}, 4000);
	}, []);

	const dismissToast = (id: number) => {
		setToasts((t) => t.filter((toast) => toast.id !== id));
	};

	const authHeaders = useCallback((): Record<string, string> => {
		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;
		return token ? { Authorization: `Bearer ${token}` } : {};
	}, []);

	useEffect(() => {
		if (!receiptModalOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setReceiptModalOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [receiptModalOpen]);

	useEffect(() => {
		return () => {
			if (receiptPreview?.url) URL.revokeObjectURL(receiptPreview.url);
		};
	}, [receiptPreview?.url]);

	const openReceiptPreview = useCallback(async () => {
		if (!quotation?.detail?.quotation_document_id) {
			pushToast("Payment receipt document is not available.", "error");
			return;
		}

		setReceiptLoading(true);

		try {
			const response = await fetch(
				`/api/quotations/${quotation.id}/documents/${quotation.detail.quotation_document_id}/payment_proof`,
				{
					method: "GET",
					headers: { Accept: "*/*", ...authHeaders() },
					cache: "no-store",
				}
			);

			if (!response.ok) {
				throw new Error(`Unable to load payment proof (${response.status}).`);
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);

			setReceiptPreview((current) => {
				if (current?.url) URL.revokeObjectURL(current.url);
				return { url, mimeType: blob.type };
			});

			setReceiptModalOpen(true);
		} catch (previewError) {
			console.error("Payment proof preview error:", previewError);
			pushToast(
				previewError instanceof Error
					? previewError.message
					: "Unable to load payment proof.",
				"error"
			);
		} finally {
			setReceiptLoading(false);
		}
	}, [authHeaders, pushToast, quotation]);

	const closeReceiptPreview = useCallback(() => {
		setReceiptModalOpen(false);
	}, []);

	useEffect(() => {
		if (!quotationId) return;

		const loadQuotation = async () => {
			try {
				const response = await fetch(
					`/api/quotations/${encodeURIComponent(quotationId)}`,
					{
						headers: { Accept: "application/json", ...authHeaders() },
						cache: "no-store",
					}
				);

				const payload = await response.json().catch(() => null);

				if (!response.ok) {
					throw new Error(payload?.message || "Unable to load quotation.");
				}

				setQuotation((payload?.data ?? payload) as PaymentQuotation);
			} catch (loadError) {
				setError(
					loadError instanceof Error
						? loadError.message
						: "Unable to load quotation."
				);
			} finally {
				setLoading(false);
			}
		};

		void loadQuotation();
	}, [authHeaders, quotationId]);

	const verifyPayment = useCallback(async () => {
		if (!quotation) return;

		setVerifying(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/quotations/${encodeURIComponent(String(quotation.id))}/verify-payment`,
				{
					method: "POST",
					headers: { Accept: "application/json", ...authHeaders() },
				}
			);

			const payload = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(payload?.message || "Unable to verify payment.");
			}

			setQuotation((current) =>
				current ? { ...current, status: "paid" } : current
			);

			pushToast(
				"Payment verified. The quotation is now marked as paid and notifications were sent.",
				"success"
			);
		} catch (verifyError) {
			pushToast(
				verifyError instanceof Error
					? verifyError.message
					: "Unable to verify payment.",
				"error"
			);
		} finally {
			setVerifying(false);
		}
	}, [authHeaders, pushToast, quotation]);

	const detail = quotation?.detail;

	const isPaid =
		quotation?.status === "paid" ||
		quotation?.status === "contract_sent" ||
		quotation?.status === "completed";

	const durationLabel =
		detail?.duration_type ??
		(detail?.duration != null
			? `${detail.duration} ${detail.duration === 1 ? "month" : "months"}`
			: "—");

	const priceBreakdownRows = useMemo<[string, string][]>(() => {
		if (!detail) return [];
		return [
			["Package Price", formatAmount(detail.package_price)],
			[
				"VAT",
				detail.vat_amount != null
					? `${formatAmount(detail.vat_amount)}${detail.vat_percentage != null
						? ` (${detail.vat_percentage}%)`
						: ""
					}`
					: "Not provided",
			],
			["Duration", durationLabel],
			["Subtotal", formatAmount(detail.subtotal)],
			["Contract & Admin Fee", formatAmount(detail.contract_admin_fee)],
			["Contract/Admin Fee VAT (12%)", formatAmount(detail.contract_vat)],
			["Total Amount", formatAmount(detail.total)],
		];
	}, [detail, durationLabel]);

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#F4F7FB] px-6">
				<div className="text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
						<Loader2 className="h-5 w-5 animate-spin text-[#0D47A1]" />
					</div>
					<p className="mt-4 text-sm font-semibold text-[#0B1F4A]">
						Loading payment information...
					</p>
				</div>
			</main>
		);
	}

	if (error && !quotation) {
		return (
			<main className="min-h-screen bg-[#F4F7FB] px-4 py-8 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-xl pt-8">
					<div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
						<div className="flex flex-col items-center px-6 py-12 text-center">
							<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
								<Receipt className="h-6 w-6" />
							</div>

							<h1 className="mt-5 text-xl font-bold text-[#0B1F4A]">
								Payment verification unavailable
							</h1>

							<p className="mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
								{error}
							</p>

							<Link
								href="/admin/quotation"
								className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0B1F4A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163568]"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to quotations
							</Link>
						</div>
					</div>
				</div>
			</main>
		);
	}

	if (!quotation) return null;

	return (
		<main className="min-h-screen bg-[#F4F7FB]">
			<div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
				<div className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight text-[#0B1F4A] sm:text-3xl">
						Payment Verification
					</h1>

					<p className="mt-1.5 text-sm text-[#64748B]">
						Review the payment information before confirming this quotation.
					</p>
				</div>

				<div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
					<div className="space-y-5">
						<SectionCard
							icon={<UserRound className="h-4 w-4" />}
							title="Client & Service"
							description="Quotation and customer information"
						>
							<dl className="divide-y divide-[#EEF2F7]">
								<InfoRow label="Client" value={formatValue(detail?.full_name)} />
								<InfoRow label="Email" value={formatValue(detail?.email)} />
								<InfoRow label="Phone" value={formatValue(detail?.phone)} />
								<InfoRow label="Company" value={formatValue(detail?.company_name)} />
								<InfoRow label="Service" value={formatValue(quotation.service_name)} />
								<InfoRow label="Branch" value={formatValue(quotation.branch)} />
							</dl>
						</SectionCard>

						<SectionCard
							icon={<Receipt className="h-4 w-4" />}
							title="Price Breakdown"
							description="Quotation payment summary"
						>
							<dl className="divide-y divide-[#EEF2F7]">
								{priceBreakdownRows.map(([label, value]) => (
									<InfoRow key={label} label={label} value={value} />
								))}
							</dl>
						</SectionCard>
					</div>

					<div className="space-y-5">
						<SectionCard
							icon={<Receipt className="h-4 w-4" />}
							title="Payment Information"
							description="Submitted payment details"
						>
							<dl className="divide-y divide-[#EEF2F7]">
								<InfoRow label="Payment Method" value={formatValue(detail?.payment_method)} />
								<InfoRow label="Reference Number" value={formatValue(detail?.transaction_id)} />
								<InfoRow label="Amount Paid" value={formatAmount(detail?.total)} />
							</dl>

							{detail?.quotation_document_id && (
								<button
									type="button"
									onClick={openReceiptPreview}
									disabled={receiptLoading}
									className="mt-4 mb-4 flex w-full items-center justify-between gap-3 rounded-xl border border-[#D9E5F5] bg-[#F7FAFF] px-4 py-3.5 text-left transition hover:border-[#AFC6E8] hover:bg-[#F1F6FF] disabled:cursor-not-allowed disabled:opacity-60"
								>
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0D47A1] shadow-sm">
											<FileCheck2 className="h-4 w-4" />
										</div>

										<div className="min-w-0">
											<p className="text-sm font-semibold text-[#0B1F4A]">
												Payment Proof
											</p>
											<p className="mt-0.5 truncate text-xs text-[#64748B]">
												{receiptLoading
													? "Loading payment receipt..."
													: "View submitted payment receipt"}
											</p>
										</div>
									</div>

									<div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0D47A1]">
										{receiptLoading ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<>
												<span className="hidden sm:inline">View</span>
												<Eye className="h-4 w-4" />
											</>
										)}
									</div>
								</button>
							)}
						</SectionCard>

						<section
							className={`overflow-hidden rounded-2xl border ${isPaid
									? "border-emerald-200 bg-emerald-50/70"
									: "border-[#D9E2F0] bg-white"
								} shadow-[0_4px_20px_rgba(11,31,74,0.04)]`}
						>
							<div className="p-5 sm:p-6">
								<div className="flex items-start gap-3">
									<div
										className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isPaid
												? "bg-emerald-100 text-emerald-600"
												: "bg-[#EEF4FF] text-[#0D47A1]"
											}`}
									>
										<CheckCircle2 className="h-5 w-5" />
									</div>

									<div>
										<h2 className="text-sm font-bold text-[#0B1F4A]">
											{isPaid ? "Payment verified" : "Ready for verification"}
										</h2>

										<p className="mt-1 text-xs leading-5 text-[#64748B]">
											{isPaid
												? "This quotation has already been marked as paid."
												: "Confirm that the submitted payment information and proof are valid before proceeding."}
										</p>
									</div>
								</div>

								<button
									type="button"
									onClick={verifyPayment}
									disabled={verifying || isPaid}
									className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white transition ${isPaid
											? "cursor-not-allowed bg-emerald-600"
											: "bg-[#0B1F4A] hover:bg-[#163568] active:scale-[0.99]"
										} disabled:cursor-not-allowed disabled:opacity-70`}
								>
									{verifying ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Verifying payment...
										</>
									) : isPaid ? (
										<>
											<CheckCircle2 className="h-4 w-4" />
											Payment Verified
										</>
									) : (
										<>
											<CheckCircle2 className="h-4 w-4" />
											Verify Payment
										</>
									)}
								</button>

								{!isPaid && (
									<p className="mt-3 text-center text-[11px] leading-4 text-[#94A3B8]">
										By continuing, the quotation will be marked as paid and
										payment verification notifications will be sent.
									</p>
								)}
							</div>
						</section>
					</div>
				</div>
			</div>

			{receiptModalOpen && receiptPreview && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="Payment proof preview"
					className="fixed inset-0 z-[1000] flex items-end justify-center bg-[#06142F]/80 backdrop-blur-sm sm:items-center sm:p-4"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) closeReceiptPreview();
					}}
				>
					<div className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[90vh] sm:rounded-2xl lg:max-w-5xl">
						<div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5EAF2] bg-white px-4 py-3.5 sm:px-6 sm:py-4">
							<div className="flex min-w-0 items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#0D47A1]">
									<FileCheck2 className="h-4 w-4" />
								</div>

								<div className="min-w-0">
									<h2 className="truncate text-sm font-bold text-[#0B1F4A] sm:text-base">
										Payment Proof
									</h2>
									<p className="truncate text-xs text-[#64748B]">
										Submitted payment receipt
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={closeReceiptPreview}
								aria-label="Close payment proof"
								className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0B1F4A]"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="min-h-0 flex-1 overflow-auto bg-[#E9EEF5] p-3 sm:p-6">
							<div className="flex min-h-full items-center justify-center">
								{isPdfMime(receiptPreview.mimeType) ? (
									<iframe
										src={receiptPreview.url}
										title="Payment receipt"
										className="h-[70vh] w-full rounded-lg border-0 bg-white shadow-lg sm:h-full sm:min-h-[70vh]"
									/>
								) : isImageMime(receiptPreview.mimeType) ? (
									<img
										src={receiptPreview.url}
										alt="Payment receipt"
										className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
									/>
								) : (
									<div className="rounded-2xl bg-white px-6 py-10 text-center shadow-lg">
										<FileCheck2 className="mx-auto h-10 w-10 text-[#0D47A1]" />
										<h3 className="mt-4 text-base font-bold text-[#0B1F4A]">
											Preview unavailable
										</h3>
										<p className="mt-2 text-sm text-[#64748B]">
											This payment proof format cannot be previewed.
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			<ToastStack toasts={toasts} onDismiss={dismissToast} />
		</main>
	);
}