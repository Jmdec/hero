import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";

function resolveSmtpTransportConfig() {
    const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
    const port = Number.parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || "587", 10);
    const secure = (process.env.SMTP_SECURE || process.env.MAIL_SECURE) === "true" || port === 465;

    if (!host) {
        throw new Error("SMTP_HOST (or MAIL_HOST) is not configured.");
    }

    return {
        host,
        port,
        secure,
        auth: process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
            : undefined,
    };
}

export const transporter = nodemailer.createTransport(resolveSmtpTransportConfig());

// REGISTRATION EMAILS

export async function verifyEmailConfig() {
    try {
        await transporter.verify();
        return true;
    } catch {
        return false;
    }
}

export async function sendVerificationEmail(
    email: string,
    name: string,
    verificationUrl: string
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const mailOptions = {
        from:
            process.env.SMTP_FROM ||
            `"Hero Serviced Office" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify Your Email - Hero Serviced Office",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
            body{margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;}
            </style>
            </head>
            <body>
            <div style="background:#f4f7fb;padding:40px 20px;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8edf5;">
            <div style="height:6px;background:#0D47A1;"></div>
            <div style="padding:40px;text-align:center;">
            <h1 style="margin:0;font-size:28px;color:#0D47A1;">Hero Serviced Office</h1>
            <p style="margin-top:8px;color:#64748b;font-size:15px;">Your Workspace for Success.</p>
            </div>
            <div style="padding:0 40px 40px;">
            <h2 style="margin:0 0 20px;color:#1e293b;">Welcome, ${name}!</h2>
            <p style="font-size:15px;line-height:1.8;color:#475569;">Thank you for creating your Hero Serviced Office account. Before you can access your account, please verify your email address by clicking the button below.</p>
            <div style="text-align:center;margin:40px 0;">
            <a href="${verificationUrl}" style="display:inline-block;padding:16px 36px;background:#0D47A1;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:8px;font-size:15px;">Verify Email</a>
            </div>
            <p style="font-size:13px;color:#64748b;line-height:1.7;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size:12px;word-break:break-all;background:#f8fafc;padding:12px;border-radius:6px;color:#0D47A1;">${verificationUrl}</p>
            <p style="margin-top:30px;font-size:13px;color:#64748b;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div style="background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} Hero Serviced Office<br>All rights reserved.</div>
            </div>
            </div>
            </body>
            </html>
        `,
        text: `
            Welcome to Hero Serviced Office, ${name}

            Please verify your email address using the link below:

            ${verificationUrl}

            If you did not create this account, you may safely ignore this email.

            © ${new Date().getFullYear()} Hero Serviced Office
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("EAUTH")) {
                throw new Error("SMTP authentication failed. Check your email and App Password.");
            }
            if (error.message.includes("ECONNREFUSED")) {
                throw new Error("Unable to connect to the SMTP server.");
            }
            if (error.message.includes("Invalid login")) {
                throw new Error("Invalid SMTP credentials.");
            }
        }
        throw error;
    }
}

// QUOTATION EMAILS

export interface QuotationDetail {
    full_name: string;
    id_type?: string | null;
    id_number?: string | null;
    id_name?: string | null;
    id_address?: string | null;
    signatory_details?: string | null;
    government_id_file?: string | null;
    signatory_id_file?: string | null;
    receipt_url?: string | null;
    government_id_url?: string | null;
    signatory_id_url?: string | null;
    company_name?: string | null;
    email: string;
    phone: string;
    request?: string | null;
    payment_method?: string | null;
    transaction_id?: string | null;
    receipt?: string | null;
    seats?: number | null;
    date?: string | null;
    time?: string | null;
    duration_type?: string | null;
    duration?: number | string | null;
    other_requirements?: string | null;
    total?: number;
    subtotal?: number | string | null;
    months?: number | string | null;
    package_name?: string | null;
    package_price?: number | string | null;
    vat_percentage?: number | string | null;
    vat_amount?: number | string | null;
    contract_admin_fee?: number | string | null;
    discount?: number | string | null;
    discounts?: number | string | null;
    contract_content?: string | null;
    contract_updated_at?: string | null;
}

export interface QuotationPayload {
    service_id?: number | null;
    service_name: string;
    branch?: string | null;
    lease_term?: string | null;
    package?: string | null;
    event_type?: string | null;
    duration?: number | string | null;
    status?: string;
    detail: QuotationDetail;
}

export interface QuotationDocumentCopy {
    filename: string;
    content: Buffer;
    contentType: string;
}

export interface QuotationNotificationOptions {
    paymentProofCopy?: QuotationDocumentCopy | null;
    governmentIdCopy?: QuotationDocumentCopy | null;
    signatoryGovernmentIdCopy?: QuotationDocumentCopy | null;
    contractSendUrl?: string;
    verifyPaymentUrl?: string;
    useBackendDelivery?: boolean;
}

const VO_PACKAGE_PRICES: Record<string, string> = {
    Basic: "₱2,000",
    Standard: "₱3,000",
    Premium: "₱5,000",
};

function formatDisplayDate(value?: string | null): string {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatPaymentMethodLabel(value?: string | null): string {
    if (!value) return "N/A";
    return value
        .replace(/_/g, " ")
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

function quotationRow(label: string, value?: string | number | null): string {
    if (value === null || value === undefined || value === "") return "";
    return `
        <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eef2f7;font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#64748b;white-space:nowrap;">${label}</td>
            <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eef2f7;font-size:14px;color:#1e293b;font-weight:500;text-align:right;">${value}</td>
        </tr>`;
}

function formatCurrency(value: string | number | null | undefined): string {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "—";
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(numeric);
}

function buildQuotationPriceBreakdownRows(quotation: QuotationPayload): string {
    const d = quotation.detail;
    const hasPrice =
        d.package_price != null ||
        d.vat_amount != null ||
        d.subtotal != null ||
        d.contract_admin_fee != null ||
        d.total != null;

    if (!hasPrice) return "";

    const rows = [
        quotationRow(
            "Package Price",
            d.package_price != null
                ? `${formatCurrency(d.package_price)}${d.months ? ` / month × ${d.months}` : " / month"}`
                : undefined
        ),
        quotationRow(
            "VAT",
            d.vat_amount != null
                ? `${formatCurrency(d.vat_amount)}${d.vat_percentage != null ? ` (${d.vat_percentage}%)` : ""}`
                : undefined
        ),
        quotationRow("Subtotal", d.subtotal != null ? formatCurrency(d.subtotal) : undefined),
        quotationRow("Contract & Admin Fee", d.contract_admin_fee != null ? formatCurrency(d.contract_admin_fee) : undefined),
        quotationRow("Total", d.total != null ? formatCurrency(d.total) : undefined),
    ].join("");

    if (!rows) return "";

    return `
        <tr>
            <td colspan="2" style="padding:16px 0 6px 0;font-size:15px;font-weight:700;color:#0D47A1;">Price Breakdown</td>
        </tr>
        ${rows}`;
}

function formatQuotationDate(value?: string | null): string | null {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function buildQuotationDetailRows(
    q: QuotationPayload,
    options: {
        hideSeatsForVirtualOffice?: boolean;
        formattedDate?: boolean;
    } = {}
): string {
    const d = q.detail;
    const isVirtualOffice = isVirtualOfficePaymongo(q);
    const seatsRow = options.hideSeatsForVirtualOffice && isVirtualOffice
        ? ""
        : quotationRow("Seats / Attendees", d.seats);
    const dateValue = options.formattedDate ? formatQuotationDate(d.date) : d.date;

    return [
        quotationRow("Service", q.service_name),
        quotationRow("Package", q.package),
        quotationRow("Lease Term", q.lease_term),
        quotationRow("Event Type", q.event_type),
        seatsRow,
        quotationRow("Date", dateValue),
        quotationRow("Time", d.time),
        quotationRow("Duration", d.duration_type),
        quotationRow("Other Requirements", d.other_requirements),
        quotationRow("Notes", d.request),
        quotationRow("ID Type", d.id_type),
        quotationRow("ID Number", d.id_number),
        quotationRow("ID Name", d.id_name),
        quotationRow("ID Address", d.id_address),
        quotationRow("Signatory", d.signatory_details),
    ].join("");
}

function quotationWrapper(bodyHtml: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>body{margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;}</style>
    </head>
    <body>
    <div style="background:#f4f7fb;padding:40px 20px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8edf5;">
        <div style="height:6px;background:#0D47A1;"></div>
        <div style="padding:32px 40px 8px;text-align:center;">
          <h1 style="margin:0;font-size:22px;color:#0D47A1;">Hero Serviced Office</h1>
          <p style="margin-top:6px;color:#64748b;font-size:13px;">Your Workspace for Success.</p>
        </div>
        <div style="padding:16px 40px 40px;">
          ${bodyHtml}
        </div>
        <div style="background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#94a3b8;">
          23F TOWER6789, Ayala Avenue 6789, Makati City 1209, Philippines<br/>
          salesofficer@heroph.net · © ${new Date().getFullYear()} Hero Serviced Office
        </div>
      </div>
    </div>
    </body>
    </html>`;
}

function isVirtualOfficePaymongo(
    quotation: QuotationPayload
): boolean {
    const service = quotation.service_name?.toLowerCase() ?? "";

    return service.includes("virtual office");
}

const RECIPIENTS = {
    chairman: process.env.QUOTATION_CHAIRMAN_EMAIL || process.env.CONTACT_INQUIRY_CHAIRMAN_EMAIL || process.env.CHAIRMAN_EMAIL || "infinitech.eirene@gmail.com",
    president: process.env.QUOTATION_PRESIDENT_EMAIL || process.env.CONTACT_INQUIRY_PRESIDENT_EMAIL || process.env.PRESIDENT_EMAIL || "",
    generalManager: process.env.GENERAL_MANAGER_EMAIL || "",
    salesOfficer: process.env.SALES_OFFICER_EMAIL || "",
    digitalMarketing: process.env.DIGITAL_MARKETING_EMAIL || "eirenegrc.armilla@gmail.com",
    accounting: process.env.ACCOUNTING_EMAIL || "infinitech.eirene@gmail.com",
    branchManagers: {
        S01: process.env.BRANCH_MANAGER_S01_EMAIL || "armilla.eirenegrace@gmail.com",
        S02: process.env.BRANCH_MANAGER_S02_EMAIL || "armilla.eirenegrace@gmail.com",
    },
};

function getPublicAppBaseUrl(): string {
    const candidates = [
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

        if (isProd) {
            try {
                const host = new URL(normalized).hostname.toLowerCase();
                if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
                    continue;
                }
            } catch {
                continue;
            }
        }

        return normalized;
    }

    return "http://localhost:3000";
}

function toUniqueEmails(values: Array<string | null | undefined>): string[] {
    const seen = new Set<string>();
    const list: string[] = [];

    for (const value of values) {
        const email = (value || "").trim();
        if (!email) continue;
        const key = email.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        list.push(email);
    }

    return list;
}

function parseRecipientList(input: string | undefined): string[] {
    return (input || "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
}

function getBranchManagerRecipients(branch: string | null | undefined): string[] {
    const normalized = (branch || "").toLowerCase();

    if (normalized.includes("insular")) {
        return [RECIPIENTS.branchManagers.S02];
    }

    if (normalized.includes("tower") || normalized.includes("6789")) {
        return [RECIPIENTS.branchManagers.S01];
    }

    if (normalized.includes("both")) {
        return [RECIPIENTS.branchManagers.S01, RECIPIENTS.branchManagers.S02];
    }

    return [RECIPIENTS.branchManagers.S01];
}

function getCoreStakeholderRecipients(quotation: QuotationPayload): string[] {
    return toUniqueEmails([
        RECIPIENTS.chairman,
        RECIPIENTS.generalManager,
        ...getBranchManagerRecipients(quotation.branch),
        RECIPIENTS.salesOfficer,
        RECIPIENTS.digitalMarketing,
        RECIPIENTS.accounting,
    ]);
}

function getDocumentCopyAttachments(options: QuotationNotificationOptions) {
    return [
        options.paymentProofCopy,
        options.governmentIdCopy,
        options.signatoryGovernmentIdCopy,
    ].filter(
        (attachment): attachment is QuotationDocumentCopy =>
            Boolean(attachment)
    );
}

function hasPaymentCopy(options: QuotationNotificationOptions): boolean {
    return Boolean(options.paymentProofCopy);
}

function hasGovernmentIdCopy(options: QuotationNotificationOptions): boolean {
    return Boolean(options.governmentIdCopy);
}

function canGenerateContract(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions
): boolean {
    if (!isVirtualOfficePaymongo(quotation)) return false;

    const hasPaymentEvidence = hasPaymentCopy(options) || Boolean(quotation.detail.receipt);
    const hasGovernmentEvidence = hasGovernmentIdCopy(options) || Boolean(quotation.detail.government_id_file);

    return hasPaymentEvidence && hasGovernmentEvidence;
}

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLOR_PRIMARY = rgb(0.051, 0.278, 0.631); // #0D47A1
const COLOR_TEXT = rgb(0.118, 0.161, 0.231); // #1e293b
const COLOR_MUTED = rgb(0.58, 0.647, 0.722); // #94a3b8

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = sanitizePdfText(text).split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const trial = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(trial, size) > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = trial;
        }
    }
    if (current) lines.push(current);
    return lines;
}

function sanitizePdfText(text: string) {
    return text
        .replace(/₱/g, "PHP ")
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
}

function parseNumberish(value: string | number | null | undefined): number | null {
    const normalized = typeof value === "string" ? value.replace(/[^0-9.-]/g, "") : value;
    const numeric = Number(normalized ?? null);
    return Number.isFinite(numeric) ? numeric : null;
}

function formatPhp(value: number | null | undefined): string {
    const numeric = Number(value ?? 0);
    if (Number.isNaN(numeric)) return "PHP 0.00";
    return `PHP ${numeric.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Canonical service -> title-agreement suffix mapping. */
const SERVICE_AGREEMENT_LABELS: Record<string, string> = {
    "virtual office": "Virtual Office Service Agreement",
    "meeting room": "Meeting Room Service Agreement",
    "private office": "Private Office Service Agreement",
    "coworking space": "Coworking Space Service Agreement",
};

export function getContractTitle(serviceName: string | null | undefined): string {
    const normalized = (serviceName || "").trim().toLowerCase();

    if (SERVICE_AGREEMENT_LABELS[normalized]) {
        return SERVICE_AGREEMENT_LABELS[normalized];
    }

    const cleanName = (serviceName || "Service").trim();
    return `${cleanName} Service Agreement`;
}

/** Service-specific terms & conditions copy, keyed the same way as the title map. */
function getServiceSpecificTerms(serviceName: string | null | undefined): string {
    const normalized = (serviceName || "").trim().toLowerCase();

    switch (normalized) {
        case "virtual office":
            return "The Client agrees to the Provider's standard terms of service, including registered address usage, mail handling, monthly billing, renewal, and cancellation policies. This Agreement takes effect upon confirmed payment and remains in force on a month-to-month basis unless terminated by either party with thirty (30) days' written notice.";
        case "meeting room":
            return "The Client agrees to the Provider's standard terms of service for meeting room bookings, including the confirmed booking duration, room usage guidelines, and cancellation policy. This Agreement takes effect upon confirmed payment and applies solely to the booked date, time, and duration stated above.";
        case "private office":
            return "The Client agrees to the Provider's standard terms of service, including lease occupancy, billing, renewal, and cancellation policies applicable to private office leases. This Agreement takes effect upon confirmed payment and remains in force for the agreed lease term unless terminated according to the applicable terms.";
        case "coworking space":
            return "The Client agrees to the Provider's standard terms of service, including workspace access, seat usage, billing, renewal, and cancellation policies applicable to coworking space membership. This Agreement takes effect upon confirmed payment and remains in force until terminated according to the applicable service terms.";
        default:
            return "The Client agrees to the Provider's standard terms of service, including service availability, billing, renewal, and cancellation policies applicable to the selected service. This Agreement takes effect upon confirmed payment and remains in force until terminated according to the applicable service terms.";
    }
}

/**
 * Shape shared by the website Contract Preview and the email PDF generator.
 * If exposing contract data to the frontend (e.g. via an API route backing
 * the admin "Contract Preview" modal), return this exact shape so both
 * surfaces render identical content.
 */
export interface ContractData {
    service: string;
    contractTitle: string;
    clientName: string;
    companyName: string;
    signatoryName: string;
    email: string;
    phone: string;
    branch: string;
    packagePlan?: string;
    duration?: string;
    startDate?: string;
    paymentMethod?: string;
    terms: string;
    dateIssued: string;
}

/**
 * The ONE function that turns a raw quotation into contract data.
 * Website preview, PDF generator, and email body should all derive their
 * displayed values from this — never re-derive the title or service value
 * independently, and never let one surface fall back to another service's
 * data (e.g. Meeting Room falling back to Virtual Office package info).
 */
export function normalizeContractData(quotation: QuotationPayload): ContractData {
    const d = quotation.detail;
    const service = (quotation.service_name || "Service").trim();
    const companyName = d.company_name || "";
    const signatoryName = d.signatory_details || d.id_name || d.full_name;
    const durationLabel = d.duration_type || d.duration || quotation.duration;

    return {
        service,
        contractTitle: getContractTitle(service),
        clientName: d.full_name || "Client",
        companyName,
        signatoryName,
        email: d.email || "—",
        phone: d.phone || "—",
        branch: quotation.branch || "—",
        packagePlan: quotation.package || d.package_name || undefined,
        duration: durationLabel != null ? String(durationLabel) : undefined,
        startDate: d.date ? formatDisplayDate(d.date) : undefined,
        paymentMethod: d.payment_method ? formatPaymentMethodLabel(d.payment_method) : undefined,
        terms: getServiceSpecificTerms(service),
        dateIssued: new Date().toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
    };
}

function buildContractTemplateVariables(quotation: QuotationPayload): Record<string, string> {
    const d = quotation.detail;
    const contract = normalizeContractData(quotation);
    const idName = d.id_name || d.signatory_details || contract.clientName;

    const monthlyFee = VO_PACKAGE_PRICES[quotation.package || ""] ?? "—";
    const monthlyFeeAmount = parseNumberish(d.package_price) ?? parseNumberish(monthlyFee);
    const monthsCount = parseNumberish(d.months ?? d.duration) ?? 1;
    const subtotalAmount = parseNumberish(d.subtotal);
    const vatAmount = parseNumberish(d.vat_amount);
    const vatPercent = parseNumberish(d.vat_percentage);
    const contractFeeAmount = parseNumberish(d.contract_admin_fee);
    const discountAmount = parseNumberish(d.discounts ?? d.discount);
    const grandTotalAmount = parseNumberish(d.total);
    const derivedDiscount = discountAmount ?? (
        subtotalAmount != null && contractFeeAmount != null && grandTotalAmount != null
            ? Math.max(0, subtotalAmount + contractFeeAmount - grandTotalAmount)
            : null
    );

    return {
        date_issued: contract.dateIssued,
        client_name: contract.clientName,
        company_name: contract.companyName,
        company_name_segment: contract.companyName ? ` of ${contract.companyName}` : "",
        service_name: contract.service,
        contract_title: contract.contractTitle,
        branch: contract.branch,
        package: contract.packagePlan || "—",
        duration: contract.duration || "To be finalized",
        start_date: contract.startDate || "—",
        payment_method: contract.paymentMethod || "N/A",
        transaction_id: d.transaction_id || "—",
        id_type: d.id_type || "—",
        id_number: d.id_number || "—",
        id_name: idName,
        id_address: d.id_address || "—",
        signatory_details: d.signatory_details || "—",
        signatory_name: contract.signatoryName,
        email: contract.email,
        phone: contract.phone,
        terms: contract.terms,
        package_fee: monthlyFeeAmount != null ? formatPhp(monthlyFeeAmount) : "—",
        months: String(monthsCount),
        subtotal: subtotalAmount != null ? formatPhp(subtotalAmount) : "—",
        vat_percentage: vatPercent != null ? `${vatPercent}` : "—",
        vat_amount: vatAmount != null ? formatPhp(vatAmount) : "—",
        contract_admin_fee: contractFeeAmount != null ? formatPhp(contractFeeAmount) : "—",
        discount: derivedDiscount != null ? formatPhp(derivedDiscount) : "—",
        total: grandTotalAmount != null ? formatPhp(grandTotalAmount) : "—",
    };
}

function resolveContractTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key: string) => variables[key] ?? "—");
}

function buildVirtualOfficeContractTemplate(): string {
    return [
        "",
        "1. Parties\n",
        "This {{contract_title_body}} (\"Agreement\") is entered into between Hero PH Inc. (\"Provider\") and {{client_name}}{{company_name_segment}} (\"Client\"), effective as of the date of confirmed payment below.",
        "",
        "2. Service Details\n",
        "Service: {{service_name}}\n",
        "Branch: {{branch}}\n",
        "Package: {{package}}\n",
        "Duration: {{duration}}\n",
        "Start Date: {{start_date}}\n",
        "Payment Method: {{payment_method}}\n",
        "Reference No: {{transaction_id}}\n",
        "",
        "3. Client Information\n",
        "Name: {{id_name}}\n",
        "ID Type: {{id_type}}\n",
        "ID Number: {{id_number}}\n",
        "Address: {{id_address}}\n",
        "Signatory Details: {{signatory_details}}\n",
        "Email: {{email}}\n",
        "Phone: {{phone}}\n",
        "",
        "4. Price Breakdown\n",
        "Package: {{package}}\n",
        "Package Fee: {{package_fee}}\n",
        "Number of months/duration: {{months}}\n",
        "Subtotal: {{subtotal}}\n",
        "VAT ({{vat_percentage}}%): {{vat_amount}}\n",
        "Contract/Administrative Fee: {{contract_admin_fee}}\n",
        "Discount: {{discount}}\n",
        "Total: {{total}}\n",
        "",
        "5. Terms & Conditions\n",
        "{{terms}}",
        "",
    ].join("\n");
}

function buildOtherServiceContractTemplate(): string {
    return [
        "",
        "1. Parties\n",
        "This {{contract_title_body}} (\"Agreement\") is entered into between Hero PH Inc. (\"Provider\") and {{client_name}}{{company_name_segment}} (\"Client\").",
        "",
        "2. Service Details",
        "Service: {{service_name}}",
        "Branch: {{branch}}",
        "Package/Plan: {{package}}",
        "Duration: {{duration}}",
        "Start Date: {{start_date}}",
        "Payment Method: {{payment_method}}",
        "",
        "3. Client Information",
        "Client Name: {{client_name}}",
        "Company: {{company_name}}",
        "Signatory: {{signatory_name}}",
        "Email: {{email}}",
        "Phone: {{phone}}",
        "",
        "4. Terms & Conditions\n",
        "{{terms}}",
        "",
    ].join("\n");
}

/**
 * Body text uses "This <Service> Service Agreement" — the same
 * contract_title text used for the header, just without the branding line,
 * so the title and body can never diverge again.
 */
function withContractTitleBodyVariable(
    template: string,
    variables: Record<string, string>
): Record<string, string> {
    return {
        ...variables,
        contract_title_body: variables.contract_title || variables.service_name,
    };
}

function buildVirtualOfficeContractContent(quotation: QuotationPayload): string {
    const variables = withContractTitleBodyVariable(
        buildVirtualOfficeContractTemplate(),
        buildContractTemplateVariables(quotation)
    );
    return resolveContractTemplate(buildVirtualOfficeContractTemplate(), variables);
}

function buildOtherServiceContractContent(quotation: QuotationPayload): string {
    const variables = withContractTitleBodyVariable(
        buildOtherServiceContractTemplate(),
        buildContractTemplateVariables(quotation)
    );
    return resolveContractTemplate(buildOtherServiceContractTemplate(), variables);
}

function buildServiceContractContentFromAdminTemplate(quotation: QuotationPayload): string {
    return isVirtualOfficePaymongo(quotation)
        ? buildVirtualOfficeContractContent(quotation)
        : buildOtherServiceContractContent(quotation);
}

function resolveEditableContractContent(
    quotation: QuotationPayload,
    fallbackTemplateBuilder: (quotation: QuotationPayload) => string
): string {
    const raw = (quotation.detail.contract_content || "").trim();
    if (!raw) return fallbackTemplateBuilder(quotation);
    const variables = withContractTitleBodyVariable(raw, buildContractTemplateVariables(quotation));
    return resolveContractTemplate(raw, variables);
}

export function buildResolvedQuotationContractContent(quotation: QuotationPayload): string {
    return resolveEditableContractContent(quotation, buildServiceContractContentFromAdminTemplate);
}

async function renderContractPdfFromContent(args: {
    title: string;
    content: string;
    signatoryLabel: string;
}): Promise<Buffer> {
    const { title, content, signatoryLabel } = args;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let cursorY = PAGE_HEIGHT - MARGIN;

    const ensureSpace = (needed: number) => {
        if (cursorY - needed < MARGIN) {
            page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
            cursorY = PAGE_HEIGHT - MARGIN;
        }
    };

    const drawSectionHeading = (text: string) => {
        ensureSpace(28);
        cursorY -= 10; // spacing before section
        drawLine(text.toUpperCase(), { size: 11, bold: true, color: COLOR_PRIMARY, gap: 18 });
    };

    const drawFieldRow = (label: string, value: string) => {
        ensureSpace(30);
        drawLine(label, { size: 9, bold: true, color: COLOR_MUTED, gap: 12 });
        drawLine(value || "—", { size: 11, color: COLOR_TEXT, gap: 20 });
    };

    const drawLine = (
        text: string,
        opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number; align?: "left" | "center" } = {}
    ) => {
        const size = opts.size ?? 10;
        const usedFont = opts.bold ? fontBold : font;
        const color = opts.color ?? COLOR_TEXT;
        const gap = opts.gap ?? size * 1.4;

        ensureSpace(gap);
        const sanitizedText = sanitizePdfText(text);
        let x = MARGIN;
        if (opts.align === "center") {
            const textWidth = usedFont.widthOfTextAtSize(sanitizedText, size);
            x = (PAGE_WIDTH - textWidth) / 2;
        }
        page.drawText(sanitizedText, { x, y: cursorY - size, size, font: usedFont, color });
        cursorY -= gap;
    };

    const drawParagraph = (text: string, opts: { size?: number; color?: ReturnType<typeof rgb> } = {}) => {
        const size = opts.size ?? 10;
        const color = opts.color ?? COLOR_TEXT;
        const lines = wrapText(text, font, size, CONTENT_WIDTH);
        for (const line of lines) {
            drawLine(line, { size, color, gap: size * 1.5 });
        }
    };

    const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    drawLine("Hero Serviced Office", { size: 20, bold: true, color: COLOR_PRIMARY, align: "center", gap: 26 });
    drawLine(title, { size: 11, color: COLOR_MUTED, align: "center", gap: 28 });
    drawLine(`Date Issued: ${today}`, { size: 10, gap: 24 });

    // Parse the resolved template content into sections/fields so the PDF
    // renders with the same label/value hierarchy as the website preview,
    // instead of one long wrapped paragraph per block.
    const blocks = content.split(/\r?\n\r?\n/).map((block) => block.trim()).filter(Boolean);

    for (const block of blocks) {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        const headingMatch = lines[0].match(/^(\d+\.\s*[A-Za-z &]+)$/);
        if (headingMatch) {
            drawSectionHeading(headingMatch[1]);
            for (const fieldLine of lines.slice(1)) {
                const fieldMatch = fieldLine.match(/^([A-Za-z /&]+):\s*(.*)$/);
                if (fieldMatch) {
                    drawFieldRow(fieldMatch[1].trim(), fieldMatch[2].trim());
                } else {
                    drawParagraph(fieldLine);
                    cursorY -= 4;
                }
            }
            continue;
        }

        drawParagraph(lines.join(" "));
        cursorY -= 6;
    }

    cursorY -= 20;
    ensureSpace(140);
    drawLine("AGREED AND ACCEPTED", { size: 11, bold: true, color: COLOR_PRIMARY, gap: 24 });
    drawLine("PROVIDER", { size: 9, bold: true, color: COLOR_MUTED, gap: 16 });
    drawLine("Hero PH Inc.", { bold: true, gap: 40 });
    drawLine("_______________________________", { gap: 14 });
    drawLine("Authorized Representative / Date", { size: 9, color: COLOR_MUTED, gap: 30 });

    drawLine("CLIENT", { size: 9, bold: true, color: COLOR_MUTED, gap: 16 });
    drawLine(`${signatoryLabel}`, { bold: true, gap: 40 });
    drawLine("_______________________________", { gap: 14 });
    drawLine("Signature / Date", { size: 9, color: COLOR_MUTED });

    ensureSpace(30);
    drawLine(
        "23F TOWER6789, Ayala Avenue 6789, Makati City 1209, Philippines · salesofficer@heroph.net",
        { size: 8, color: COLOR_MUTED, align: "center" }
    );

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
}

async function generateNonVirtualOfficeContractPdf(quotation: QuotationPayload): Promise<Buffer> {
    const content = resolveEditableContractContent(quotation, buildOtherServiceContractContent);
    const contract = normalizeContractData(quotation);

    return renderContractPdfFromContent({
        title: contract.contractTitle,
        content,
        signatoryLabel: contract.signatoryName,
    });
}

async function generateVirtualOfficeContractPdf(quotation: QuotationPayload): Promise<Buffer> {
    const content = resolveEditableContractContent(quotation, buildVirtualOfficeContractContent);
    const contract = normalizeContractData(quotation);

    return renderContractPdfFromContent({
        title: contract.contractTitle,
        content,
        signatoryLabel: contract.signatoryName,
    });
}

async function generateContractPdfByService(quotation: QuotationPayload): Promise<Buffer> {
    if (isVirtualOfficePaymongo(quotation)) {
        return generateVirtualOfficeContractPdf(quotation);
    }
    return generateNonVirtualOfficeContractPdf(quotation);
}

// User & Admin Notification Emails 

export async function sendQuotationUserEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const firstName = quotation.detail.full_name.split(" ")[0] || quotation.detail.full_name;

    const idAttachments = [
        options.governmentIdCopy,
        options.signatoryGovernmentIdCopy,
    ].filter(
        (attachment): attachment is QuotationDocumentCopy => Boolean(attachment)
    );

    const attachments: {
        filename: string;
        content: Buffer;
        contentType: string;
    }[] = [...idAttachments];

    console.log("Attachments:", attachments?.length ?? 0);

    const docCopyLine = idAttachments.length > 0
        ? `<p style="font-size:13px;color:#64748b;line-height:1.7;margin-top:16px;">Copies of your uploaded ID documents are attached for your records.</p>`
        : "";

    const signatoryLine = quotation.detail.signatory_details
        ? `<p style="font-size:15px;line-height:1.8;color:#475569;">Signatory Details: <strong>${quotation.detail.signatory_details}</strong></p>`
        : "";

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">Hi ${firstName},</p>
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Thank you for your interest in Hero Serviced Office. We've received your
            ${quotation.service_name.toLowerCase()} request and our team will get back
            to you within <strong>24 business hours</strong>.
        </p>
        ${docCopyLine}
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            ${buildQuotationDetailRows(quotation, {
        hideSeatsForVirtualOffice: true,
        formattedDate: true,
    })}
        </table>
        <p style="font-size:13px;color:#64748b;line-height:1.7;margin-top:24px;">
            If any of the details above look off, just reply to this email and we'll sort it out for you.
        </p>`;

    const mailOptions = {
        from:
            process.env.SMTP_FROM ||
            `"Hero Serviced Office" <${process.env.SMTP_USER}>`,
        to: quotation.detail.email,
        subject: `We've received your ${quotation.service_name} request`,
        html: quotationWrapper(body),
        text: `Hi ${firstName},

        Thank you for your ${quotation.service_name} request. Our team will get back to you within 24 business hours.

© ${new Date().getFullYear()} Hero Serviced Office`,
        attachments,
    };

    return sendQuotationMailWithErrorHandling(mailOptions);
}

export async function sendQuotationContractEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const d = quotation.detail;
    const firstName = d.full_name.split(" ")[0] || d.full_name;
    const contract = normalizeContractData(quotation);
    const attachments = [...getDocumentCopyAttachments(options)];
    const contractBuffer = await generateContractPdfByService(quotation);

    // Dynamic filename: "[Client Name] - [Service] Service Agreement.pdf"
    const contractFilename = `${contract.clientName} - ${contract.contractTitle}.pdf`;

    attachments.push({
        filename: contractFilename,
        content: contractBuffer,
        contentType: "application/pdf",
    });

    const hasContractAttachment = attachments.some((attachment) =>
        attachment.filename === contractFilename
    );
    if (!hasContractAttachment) {
        throw new Error("Contract PDF attachment missing. Contract email not sent.");
    }

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">Hi ${firstName},</p>
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Your ${quotation.service_name.toLowerCase()} contract is ready to review. We have attached the latest contract document for your reference.
        </p>
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Please review the PDF carefully and reply to this email if you need any updates before we proceed.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            ${buildQuotationDetailRows(quotation, {
        hideSeatsForVirtualOffice: true,
        formattedDate: true,
    })}
        </table>`;

    const mailOptions = {
        from: process.env.SMTP_FROM || `"Hero Serviced Office" <${process.env.SMTP_USER}>`,
        to: d.email,
        replyTo: d.email,
        subject: `Your ${quotation.service_name} contract`,
        html: quotationWrapper(body),
        text: `Hi ${firstName},\n\nYour ${quotation.service_name} contract is ready to review. Please reply if you need anything changed.`,
        attachments,
    };

    return sendQuotationMailWithErrorHandling(mailOptions);
}

export async function sendQuotationPaymentVerificationEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const d = quotation.detail;
    const recipients = toUniqueEmails([
        RECIPIENTS.accounting,
        ...parseRecipientList(process.env.ACCOUNTING_NOTIFICATION_EMAILS),
    ]);
    const attachments = [...getDocumentCopyAttachments(options)];
    const quoteId = (quotation as QuotationPayload & { id?: string | number }).id;
    const verifyPaymentUrl = options.verifyPaymentUrl || options.contractSendUrl || (
        quoteId !== undefined && quoteId !== null
            ? `${getPublicAppBaseUrl()}/api/quotations/${encodeURIComponent(String(quoteId))}/payment-approved?source=payment-verification`
            : undefined
    );

    const priceBreakdownRows = buildQuotationPriceBreakdownRows(quotation);

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">Hi Accounting Team,</p>
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            A payment proof has been submitted for <strong>${d.full_name}</strong> for the <strong>${quotation.service_name}</strong> quotation.
            Please review the payment details below and confirm that the payment is correct and verified.
        </p>
        ${verifyPaymentUrl ? `
        <p style="text-align:center;margin:24px 0;">
            <a href="${verifyPaymentUrl}" style="display:inline-block;padding:14px 24px;background:#0D47A1;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:700;">
                Payment Verified
            </a>
        </p>
        <p style="font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
            This will notify the admin department that payment has been verified and is correct. The contract will still need to be sent manually by an admin.
        </p>` : ""}
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            ${quotationRow("Client", d.full_name)}
            ${quotationRow("Email", d.email)}
            ${quotationRow("Phone", d.phone)}
            ${quotationRow("Branch", quotation.branch)}
            ${quotationRow("Payment Method", d.payment_method)}
            ${quotationRow("Reference No", d.transaction_id)}
            ${priceBreakdownRows}
        </table>`;

    const mailOptions = {
        from: process.env.SMTP_FROM || `"Hero Serviced Office" <${process.env.SMTP_USER}>`,
        to: recipients,
        replyTo: d.email,
        subject: `Payment verification for ${quotation.service_name} quotation`,
        html: quotationWrapper(body),
        text: `Payment verification for ${quotation.service_name} quotation from ${d.full_name}. Please review the attached payment proof and confirm it is correct.`,
        attachments,
    };

    return sendQuotationMailWithErrorHandling(mailOptions);
}

export async function sendQuotationPaymentVerifiedAdminEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const d = quotation.detail;
    const recipients = toUniqueEmails([
        ...getCoreStakeholderRecipients(quotation),
        ...parseRecipientList(process.env.ADMIN_NOTIFICATION_EMAILS),
    ]);
    const attachments = [...getDocumentCopyAttachments(options)];
    const receiptRow = quotationRow("Receipt File", d.receipt || d.receipt_url);
    const priceBreakdownRows = buildQuotationPriceBreakdownRows(quotation);
    const quoteId = (quotation as QuotationPayload & { id?: string | number }).id;
    const dashboardUrl = options.contractSendUrl || (
        quoteId !== undefined && quoteId !== null
            ? `${getPublicAppBaseUrl()}/admin/quotation?status=paid&search=${encodeURIComponent(String(quoteId))}`
            : `${getPublicAppBaseUrl()}/admin/quotation?status=paid`
    );

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">Hi Admin Team,</p>
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Payment for <strong>${d.full_name}</strong> for the <strong>${quotation.service_name}</strong> quotation has been verified and confirmed to be correct and true.
        </p>
        <p style="font-size:14px;line-height:1.7;color:#64748b;">
            The uploaded payment receipt is included below and attached to this email for your review.
        </p>
        <p style="text-align:center;margin:24px 0;">
            <a href="${dashboardUrl}" style="display:inline-block;padding:14px 24px;background:#0D47A1;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:700;">
                Go to Quotation Dashboard
            </a>
        </p>
        <p style="font-size:14px;line-height:1.7;color:#64748b;">
            The contract is still required to be sent manually by an admin to the client. Use the dashboard link above to open the quotation queue and send the contract.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            ${quotationRow("Client", d.full_name)}
            ${quotationRow("Email", d.email)}
            ${quotationRow("Phone", d.phone)}
            ${quotationRow("Branch", quotation.branch)}
            ${quotationRow("Payment Method", d.payment_method)}
            ${quotationRow("Reference No", d.transaction_id)}
            ${receiptRow}
            ${priceBreakdownRows}
        </table>`;

    const mailOptions = {
        from: process.env.SMTP_FROM || `"Hero Serviced Office" <${process.env.SMTP_USER}>`,
        to: recipients,
        replyTo: d.email,
        subject: `Payment verified for ${quotation.service_name} quotation`,
        html: quotationWrapper(body),
        text: `Payment for ${d.full_name} (${quotation.service_name}) has been verified and marked as paid. The contract must still be sent manually by an admin.`,
        attachments,
    };

    return sendQuotationMailWithErrorHandling(mailOptions);
}

export async function sendQuotationAdminEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const d = quotation.detail;
    const attachments = getDocumentCopyAttachments(options);
    const readyForContract = canGenerateContract(quotation, options);

    if (readyForContract) {
        try {
            const contractBuffer = await generateVirtualOfficeContractPdf(quotation);
            attachments.push({
                filename: "Hero-Virtual-Office-Contract-Reference.pdf",
                content: contractBuffer,
                contentType: "application/pdf",
            });
        } catch (error) {
            console.error("Failed to generate admin contract reference:", error);
        }
    }

    const configuredAdmins = parseRecipientList(process.env.ADMIN_NOTIFICATION_EMAILS);
    const stakeholders = getCoreStakeholderRecipients(quotation);
    const allAdminRecipients = configuredAdmins.length > 0
        ? toUniqueEmails([...configuredAdmins, ...stakeholders])
        : toUniqueEmails(stakeholders);
    const chairmanRecipient = RECIPIENTS.chairman.trim();
    const englishRecipients = chairmanRecipient
        ? allAdminRecipients.filter((email) => email.toLowerCase() !== chairmanRecipient.toLowerCase())
        : allAdminRecipients;

    const englishBody = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            A new ${quotation.service_name.toLowerCase()} quotation request has come in.
        </p>
        <p style="font-size:14px;line-height:1.7;color:#64748b;">
            This notification is being routed to the relevant team members for follow-up, including the branch manager, general manager, sales officer, and digital marketing.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
            ${quotationRow("Name", d.full_name)}
            ${quotationRow("Company", d.company_name)}
            ${quotationRow("Email", d.email)}
            ${quotationRow("Phone", d.phone)}
            ${quotationRow("Branch", quotation.branch)}
            ${buildQuotationDetailRows(quotation, {
        formattedDate: true,
    })}
            ${quotationRow("Reference No", d.transaction_id)}
            ${quotationRow("Receipt File", d.receipt)}
            ${quotationRow("Government ID File", d.government_id_file)}
            ${quotationRow("Signatory ID File", d.signatory_id_file)}
        </table>`;

    const japaneseBody = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            新しい${quotation.service_name}の見積依頼が届きました。
        </p>
        <p style="font-size:14px;line-height:1.7;color:#64748b;">
            こちらは担当チームへの通知メールです。支店マネージャー、総務、営業、デジタルマーケティング担当者が確認に入ります。
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
            ${quotationRow("お客様名", d.full_name)}
            ${quotationRow("会社名", d.company_name)}
            ${quotationRow("メール", d.email)}
            ${quotationRow("電話", d.phone)}
            ${quotationRow("支店", quotation.branch)}
            ${buildQuotationDetailRows(quotation, {
        formattedDate: true,
    })}
        </table>`;

    const tasks: Promise<unknown>[] = [];

    if (englishRecipients.length > 0) {
        tasks.push(sendQuotationMailWithErrorHandling({
            from: process.env.SMTP_FROM || `"Hero Serviced Office" <${process.env.SMTP_USER}>`,
            to: englishRecipients,
            replyTo: d.email,
            subject: `New ${quotation.service_name} request from ${d.full_name}`,
            html: quotationWrapper(englishBody),
            text: `New ${quotation.service_name} request from ${d.full_name} (${d.email}, ${d.phone}).`,
            attachments,
        }));
    }

    if (chairmanRecipient) {
        tasks.push(sendQuotationMailWithErrorHandling({
            from: process.env.SMTP_FROM || `"Hero Serviced Office" <${process.env.SMTP_USER}>`,
            to: chairmanRecipient,
            replyTo: d.email,
            subject: `【新規見積】${quotation.service_name} の依頼が届きました`,
            html: quotationWrapper(japaneseBody),
            text: `新しい${quotation.service_name}の見積依頼が届きました。`,
            attachments,
        }));
    }

    return Promise.allSettled(tasks).then((results) => {
        const rejected = results.filter((result) => result.status === "rejected");
        if (rejected.length > 0) {
            const reasons = rejected.map((result) => result.reason);
            throw new Error(reasons.join("; "));
        }

        return {
            success: true,
            message: "Quotation notification emails sent.",
        };
    });
}

export async function sendQuotationPaymentLinkEmail(
    quotation: QuotationPayload,
    paymentUrl: string,
    options: { expiresInDays?: number } = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const d = quotation.detail;
    const fullName = d.full_name;
    const expiresInDays = options.expiresInDays ?? 3;

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">Good Day Mr./Ms. ${fullName},</p>
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Your quotation has been reviewed and is now ready for payment.
            Click the button below to proceed to your dedicated payment page.
        </p>
        <p style="text-align:center;margin:20px 0;">
            <a href="${paymentUrl}" style="display:inline-block;padding:12px 20px;background:#0D47A1;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:700;">
                Pay Now
            </a>
        </p>
        <p style="font-size:13px;color:#64748b;line-height:1.7;">
            This secure link expires in ${expiresInDays} day${expiresInDays === 1 ? "" : "s"}. If it expires,
            please reply to this email and we will send you a new payment link.
        </p>
        <p style="font-size:12px;color:#64748b;word-break:break-all;margin-top:10px;">${paymentUrl}</p>
    `;

    const mailOptions = {
        from: process.env.SMTP_FROM || `"Hero Serviced Office" <${process.env.SMTP_USER}>`,
        to: d.email,
        subject: `Payment link — ${quotation.service_name}`,
        html: quotationWrapper(body),
        text: `Good Day Mr./Ms. ${fullName},\n\nYour quotation is now ready for payment. Open this secure link: ${paymentUrl}\n\nThis link expires in ${expiresInDays} day${expiresInDays === 1 ? "" : "s"}.`,
    };

    return sendQuotationMailWithErrorHandling(mailOptions);
}

async function sendQuotationMailWithErrorHandling(
    mailOptions: Parameters<typeof transporter.sendMail>[0]
) {
    try {
        console.log("Sending email...");
        console.log("To:", mailOptions.to);
        console.log("Subject:", mailOptions.subject);
        console.log(
            "Attachments:",
            mailOptions.attachments?.map((a) => ({
                filename: a.filename,
                size:
                    Buffer.isBuffer(a.content)
                        ? a.content.length
                        : "stream",
            }))
        );

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully:", info.messageId);

        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error("Email send failed:", error);

        if (error instanceof Error) {
            if (error.message.includes("EAUTH")) {
                throw new Error(
                    "SMTP authentication failed. Check your email and App Password."
                );
            }

            if (error.message.includes("ECONNREFUSED")) {
                throw new Error(
                    "Unable to connect to the SMTP server."
                );
            }

            if (error.message.includes("Invalid login")) {
                throw new Error("Invalid SMTP credentials.");
            }
        }

        throw error;
    }
}

export async function sendQuotationNotifications(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    const shouldUseBackendByEnv =
        process.env.NEXT_PUBLIC_USE_BACKEND_EMAIL === "true" || process.env.USE_BACKEND_EMAIL === "true";
    const useBackend = options.useBackendDelivery ?? shouldUseBackendByEnv;

    if (useBackend) {
        const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '').replace(/\/$/, '') || undefined;
        if (!backendBase) {
            console.warn('BACKEND URL not configured; falling back to local nodemailer.');
        } else {
            try {
                const id = (quotation as QuotationPayload & { id?: number | string }).id;
                if (id) {
                    const res = await fetch(`${backendBase}/api/quotations/${encodeURIComponent(String(id))}/send-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (res.ok) return { userSent: true, adminSent: true };
                    console.warn('Backend send-email returned', res.status);
                } else {
                    // POST the quotation payload and let backend create record + send notifications
                    const res = await fetch(`${backendBase}/api/quotations`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(quotation),
                    });
                    if (res.ok) return { userSent: true, adminSent: true };
                    console.warn('Backend create-quotation returned', res.status);
                }
            } catch (err) {
                console.error('Backend email delegation failed:', err);
            }
        }
    }

    // Fallback: send directly using nodemailer from this server
    const [userResult, adminResult] = await Promise.allSettled([
        sendQuotationUserEmail(quotation, options),
        sendQuotationAdminEmail(quotation, options),
    ]);

    if (userResult.status === "rejected") {
        console.error("Quotation user email failed:", userResult.reason);
    }
    if (adminResult.status === "rejected") {
        console.error("Quotation admin email failed:", adminResult.reason);
    }

    return {
        userSent: userResult.status === "fulfilled",
        adminSent: adminResult.status === "fulfilled",
    };
}

// Helpers for directly requesting backend actions
export async function requestBackendSendPaymentLink(quotationId: string | number) {
    const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '').replace(/\/$/, '');
    if (!backendBase) throw new Error('BACKEND_URL not configured');
    const res = await fetch(`${backendBase}/api/quotations/${encodeURIComponent(String(quotationId))}/send-payment-link`, { method: 'POST' });
    return res.json();
}

export async function requestBackendSendEmail(quotationId: string | number) {
    const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '').replace(/\/$/, '');
    if (!backendBase) throw new Error('BACKEND_URL not configured');
    const res = await fetch(`${backendBase}/api/quotations/${encodeURIComponent(String(quotationId))}/send-email`, { method: 'POST' });
    return res.json();
}