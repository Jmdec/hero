import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { mapQuotationToVOContractFields, VOContractFields } from "@/components/contracts/VOContractDocument";
import { renderVirtualOfficeContractHtml } from "@/lib/renderVOContract.serve";

function resolveSmtpTransportConfig() {
    const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
    const configuredPort = Number.parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || "587", 10);
    const port = configuredPort;
    const secure = (process.env.SMTP_SECURE || process.env.MAIL_SECURE) === "true" || port === 465;
    const username = process.env.SMTP_USER || process.env.MAIL_USERNAME;
    const password = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;
    const timeout = Number.parseInt(process.env.SMTP_TIMEOUT || process.env.MAIL_TIMEOUT || "15", 10) * 1000;

    if (!host) {
        throw new Error("SMTP_HOST (or MAIL_HOST) is not configured.");
    }

    return {
        host,
        port,
        secure,
        connectionTimeout: timeout,
        greetingTimeout: timeout,
        socketTimeout: timeout,
        requireTLS: !secure && (process.env.SMTP_ENCRYPTION || process.env.MAIL_ENCRYPTION) === "tls" || port === 587,
        auth: username && password
            ? {
                user: username,
                pass: password,
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

/**
 * Shared responsive styles injected into every email's <head>.
 * Email clients strip most external/embedded CSS, but Gmail (web + app),
 * Apple Mail, Outlook.com/new Outlook, and Yahoo all honor a <style> block
 * in <head>, including @media queries. Outlook desktop (Word-rendering
 * engine) ignores @media, but degrades gracefully to the inline/table
 * styles below, so nothing breaks there — it just stays desktop-sized.
 */
const RESPONSIVE_EMAIL_STYLES = `
    body { margin:0; padding:0; background:#f4f7fb; font-family:Arial,Helvetica,sans-serif; }
    table { border-collapse:collapse; }
    img { border:0; line-height:100%; outline:none; text-decoration:none; }
    a { text-decoration:none; }
    .email-bg { background:#f4f7fb; padding:40px 20px; }
    .email-card { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e8edf5; }
    .email-header { padding:40px; text-align:center; }
    .email-body { padding:0 40px 40px; }
    .email-footer { background:#f8fafc; padding:20px; text-align:center; font-size:12px; color:#94a3b8; }
    .email-btn { display:inline-block; padding:16px 36px; background:#0D47A1; color:#ffffff !important; text-decoration:none; font-weight:bold; border-radius:8px; font-size:15px; }
    .detail-table { width:100%; border-collapse:collapse; margin-top:16px; }
    .detail-label { padding:10px 0; border-bottom:1px solid #eef2f7; font-size:12px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:#64748b; white-space:nowrap; vertical-align:top; }
    .detail-value { padding:10px 0 10px 16px; border-bottom:1px solid #eef2f7; font-size:14px; color:#1e293b; font-weight:500; text-align:right; word-break:break-word; }

    @media only screen and (max-width: 600px) {
        .email-bg { padding:24px 12px !important; }
        .email-card { border-radius:12px !important; }
        .email-header { padding:28px 20px 8px !important; }
        .email-header h1 { font-size:22px !important; }
        .email-body { padding:0 20px 28px !important; }
        .email-body h2 { font-size:18px !important; }
        .email-btn { display:block !important; width:100% !important; box-sizing:border-box !important; padding:16px 20px !important; text-align:center !important; }
        .detail-label, .detail-value {
            display:block !important;
            width:100% !important;
            text-align:left !important;
            padding:4px 0 !important;
            white-space:normal !important;
        }
        .detail-label { border-bottom:0 !important; padding-top:10px !important; }
        .detail-value { padding-bottom:10px !important; }
        .word-break { word-break:break-all !important; }
    }
`;

function emailDocument(headExtra: string, bodyHtml: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>${RESPONSIVE_EMAIL_STYLES}${headExtra}</style>
        </head>
        <body>
        ${bodyHtml}
        </body>
        </html>`;
}

export async function sendVerificationEmail(
    email: string,
    name: string,
    verificationUrl: string
) {
    const username = process.env.SMTP_USER || process.env.MAIL_USERNAME;
    const password = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;

    if (!username || !password) {
        throw new Error("SMTP credentials are not configured.");
    }

    const bodyHtml = `
        <div class="email-bg">
        <div class="email-card">
        <div style="height:6px;background:#0D47A1;"></div>
        <div class="email-header">
        <h1 style="margin:0;font-size:28px;color:#0D47A1;">Hero Serviced Office, Inc.</h1>
        <p style="margin-top:8px;color:#64748b;font-size:15px;">Your Workspace for Success.</p>
        </div>
        <div class="email-body">
        <h2 style="margin:0 0 20px;color:#1e293b;">Welcome, ${name}!</h2>
        <p style="font-size:15px;line-height:1.8;color:#475569;">Thank you for creating your Hero Serviced Office, Inc. account. Before you can access your account, please verify your email address by clicking the button below.</p>
        <div style="text-align:center;margin:40px 0;">
        <a href="${verificationUrl}" class="email-btn">Verify Email</a>
        </div>
        <p style="font-size:13px;color:#64748b;line-height:1.7;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p class="word-break" style="font-size:12px;word-break:break-all;background:#f8fafc;padding:12px;border-radius:6px;color:#0D47A1;">${verificationUrl}</p>
        <p style="margin-top:30px;font-size:13px;color:#64748b;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="email-footer">© ${new Date().getFullYear()} Hero Serviced Office, Inc.<br>All rights reserved.</div>
        </div>
        </div>`;

    const mailOptions = {
        from:
            process.env.SMTP_FROM ||
            process.env.MAIL_FROM_ADDRESS ||
            `"Hero Serviced Office, Inc." <${username}>`,
        to: email,
        subject: "Verify Your Email - Hero Serviced Office, Inc.",
        html: emailDocument("", bodyHtml),
        text: `
            Welcome to Hero Serviced Office, Inc., ${name}

            Please verify your email address using the link below:

            ${verificationUrl}

            If you did not create this account, you may safely ignore this email.

            © ${new Date().getFullYear()} Hero Serviced Office, Inc.
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
    id?: number | string;
    quotation_id?: string | null;
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

function formatClickablePhone(value?: string | null): string {
    if (!value) return "N/A";
    const trimmed = String(value).trim();
    if (!trimmed) return "N/A";

    const digitsOnly = trimmed.replace(/[^\d+]/g, "");
    if (!digitsOnly) return trimmed;

    return `<a href="tel:${digitsOnly}" style="color:#0D47A1;text-decoration:none;">${trimmed}</a>`;
}

function quotationRow(label: string, value?: string | number | null): string {
    if (value === null || value === undefined || value === "") return "";
    return `
        <tr>
            <td class="detail-label">${label}</td>
            <td class="detail-value">${value}</td>
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

    const discountValue = parseNumberish(d.discounts ?? d.discount);
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
        ...(discountValue != null && Number(discountValue) > 0
            ? [quotationRow("Promo / Discount", `-${formatCurrency(discountValue)}`)]
            : []),
        quotationRow("Amount Due", d.total != null ? formatCurrency(d.total) : undefined),
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

const getVirtualOfficeSeatAttendee = (plan?: string | null): string => {
    const normalizedPlan = String(plan || "").trim().toLowerCase();

    if (normalizedPlan === "basic") {
        return "N/A";
    }

    if (
        normalizedPlan === "standard" ||
        normalizedPlan === "premium"
    ) {
        return "1 person";
    }

    return "N/A";
};

function buildQuotationDetailRows(
    q: QuotationPayload,
    options: {
        hideSeatsForVirtualOffice?: boolean;
        formattedDate?: boolean;
    } = {}
): string {
    const d = q.detail;
    const isVirtualOffice = isVirtualOfficePaymongo(q);

    const selectedPlan =
        q.package ||
        d.package_name ||
        null;

    const seatsAttendee = isVirtualOffice
        ? getVirtualOfficeSeatAttendee(selectedPlan)
        : d.seats != null
            ? String(d.seats)
            : null;

    const seatsRow =
        options.hideSeatsForVirtualOffice && isVirtualOffice
            ? ""
            : quotationRow(
                "Seats / Attendees",
                seatsAttendee
            );

    const dateValue = options.formattedDate
        ? formatQuotationDate(d.date)
        : d.date;

    return [
        quotationRow("Service", q.service_name),
        quotationRow("Package", selectedPlan),
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
    const inner = `
    <div class="email-bg">
      <div class="email-card">
        <div style="height:6px;background:#0D47A1;"></div>
        <div class="email-header" style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:22px;color:#0D47A1;">Hero Serviced Office, Inc.</h1>
          <p style="margin-top:6px;color:#64748b;font-size:13px;">Your Workspace for Success.</p>
        </div>
        <div class="email-body" style="padding-top:16px;">
          ${bodyHtml}
        </div>
      </div>
    </div>`;

    return emailDocument("", inner);
}

function isVirtualOfficePaymongo(
    quotation: QuotationPayload
): boolean {
    const service = quotation.service_name?.toLowerCase() ?? "";

    return service.includes("virtual office");
}

function getPublicAppBaseUrl(): string {
    const candidates = [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.APP_URL,
        process.env.LARAVEL_API_URL,
        "http://localhost:8000",
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

    return "http://localhost:8000";
}

function getPublicFrontendBaseUrl(): string {
    const candidates = [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.APP_URL,
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
                if (host === "localhost" || host === "127.0.0.1" || host === "::1") continue;
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

function getSystemMailSender(): string {
    const address = (process.env.MAIL_FROM_ADDRESS || process.env.SMTP_FROM || process.env.SMTP_USER || "").trim();
    if (!address) throw new Error("MAIL_FROM_ADDRESS or SMTP_USER is not configured.");
    const name = process.env.MAIL_FROM_NAME || "Hero Serviced Office, Inc.";
    return `"${name}" <${address}>`;
}

function parseRecipientList(input: string | undefined): string[] {
    return (input || "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
}

// const RECIPIENTS = {
//     chairman: process.env.CHAIRMAN_EMAIL || "hero.chairman@gmail.com",
//     president: process.env.PRESIDENT_EMAIL || "hero.president@gmail.com",
//     generalManager: process.env.GENERAL_MANAGER_EMAIL || "hero.generalmanager@gmail.com",
//     adminOfficer: process.env.ADMIN_OFFICER_EMAIL || "hero.adminofficer@gmail.com",
//     salesOfficer: process.env.SALES_OFFICER_EMAIL || "hero.salesofficer@gmail.com",
//     digitalMarketing: process.env.DIGITAL_MARKETING_EMAIL || "hero.digitalmarketing@gmail.com",
//     accounting: process.env.ACCOUNTING_EMAIL || "hero.accounting@gmail.com",
//     accountingofficer: process.env.ACCOUNTING_OFFICER_EMAIL || "hero.accountingofficer@gmail.com",
//     branchManagers: {
//         S01: process.env.BRANCH_MANAGER_S01_EMAIL || "hero.branchmanager.s01@gmail.com",
//         S02: process.env.BRANCH_MANAGER_S02_EMAIL || "hero.branchmanager.s02@gmail.com",
//     },
// };

const RECIPIENTS = {
    chairman: process.env.CHAIRMAN_EMAIL || "hero.chairman@gmail.com",
    president: process.env.PRESIDENT_EMAIL || "hero.president@gmail.com",
    generalManager: process.env.GENERAL_MANAGER_EMAIL || "rataguibao@rbtconsulting.com.ph",
    adminOfficer: process.env.ADMIN_OFFICER_EMAIL || "hero.adminofficer@gmail.com",
    salesOfficer: process.env.SALES_OFFICER_EMAIL || "salesofficer@heroph.net",
    digitalMarketing: process.env.DIGITAL_MARKETING_EMAIL || "digitalsalesmarketing@heroph.net",
    accounting: process.env.ACCOUNTING_EMAIL || "accounting@heroph.net",
    accountingofficer: process.env.ACCOUNTING_OFFICER_EMAIL || "accountingofficer@heroph.net",
    branchManagers: {
        S01: process.env.BRANCH_MANAGER_S01_EMAIL || "sales@heroph.net",
        S02: process.env.BRANCH_MANAGER_S02_EMAIL || "c_francisco@heroph.net",
    },
};

async function fetchDatabaseRecipients(category: string): Promise<string[]> {
    console.warn("Frontend database recipient lookup is disabled; Laravel owns notification recipients.", { category });
    return [];
}

async function getCategoryRecipientList(category: string, extras: Array<string | null | undefined> = []): Promise<string[]> {
    const dbRecipients = await fetchDatabaseRecipients(category);
    const configuredRecipients = category === "payment"
        ? [
            RECIPIENTS.salesOfficer,
            RECIPIENTS.accounting,
            RECIPIENTS.accountingofficer,
        ]
        : category === "payment_verified"
            ? [
                RECIPIENTS.branchManagers.S01,
                RECIPIENTS.branchManagers.S02,
            ]
            : [
                RECIPIENTS.generalManager,
                RECIPIENTS.digitalMarketing,
                RECIPIENTS.salesOfficer,
                RECIPIENTS.branchManagers.S01,
                RECIPIENTS.branchManagers.S02,
            ];
    const recipients = toUniqueEmails([...dbRecipients, ...configuredRecipients, ...extras]);
    console.info("Form notification recipients resolved", {
        category,
        recipientCount: recipients.length,
        recipients,
    });
    return recipients;
}

function getQuotationRecipients(branch: string | null | undefined): string[] {
    const normalizedBranch = String(branch || "").trim().toLowerCase();
    const branchManager = normalizedBranch.includes("insular") || normalizedBranch === "s02"
        ? RECIPIENTS.branchManagers.S02
        : RECIPIENTS.branchManagers.S01;

    return toUniqueEmails([
        RECIPIENTS.generalManager,
        branchManager,
        RECIPIENTS.salesOfficer,
        RECIPIENTS.digitalMarketing,
    ]);
}

function getPaymentVerifiedRecipients(branch: string | null | undefined): string[] {
    const normalizedBranch = String(branch || "").trim().toLowerCase();
    const branchManager = normalizedBranch.includes("insular") || normalizedBranch === "s02"
        ? RECIPIENTS.branchManagers.S02
        : RECIPIENTS.branchManagers.S01;

    return toUniqueEmails([
        branchManager,
        RECIPIENTS.salesOfficer,
        RECIPIENTS.adminOfficer,
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

export function normalizeContractData(quotation: QuotationPayload): ContractData {
    const d = quotation.detail;
    const service = (quotation.service_name || "Service").trim();
    const companyName = d.company_name || "";
    const signatoryName = d.signatory_details || d.id_name || d.full_name;
    const durationLabel = d.duration_type || d.duration || quotation.duration;

    return {
        service,
        contractTitle: `${service} Service Agreement`,
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

    const voContractFee = contractFeeAmount != null ? formatPhp(contractFeeAmount) : "—";
    const voServiceName = (quotation.service_name || "Virtual Office").trim() || "Virtual Office";
    const voBuilding = quotation.branch || "Tower 6789";
    const voPremisesAddress = d.id_address || "23F Tower 6789, 6789 Ayala Avenue, Makati City";
    const voUserName = d.full_name || d.id_name || contract.clientName || "TO BE FILLED OUT";
    const voUserAddress = d.id_address || "TO BE FILLED OUT";
    const voUserRep = d.signatory_details || d.id_name || contract.signatoryName || "TO BE FILLED OUT";
    const voUserEmail = d.email || "TO BE FILLED OUT";
    const voUserContact = d.phone || "TO BE FILLED OUT";
    const voSignerName = d.signatory_details || d.id_name || contract.signatoryName || "TO BE FILLED OUT";
    const voSignerAddress = d.id_address || "TO BE FILLED OUT";
    const voSignerCompany = d.company_name || "TO BE FILLED OUT";
    const voNotaryUserName = d.signatory_details || d.full_name || "TO BE FILLED OUT";
    const voNotaryUserId = d.id_number || "TO BE FILLED OUT";
    const voNotaryUserIssue = d.id_address || "TO BE FILLED OUT";

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
        contract_admin_fee: voContractFee,
        discount: derivedDiscount != null ? formatPhp(derivedDiscount) : "—",
        total: grandTotalAmount != null ? formatPhp(grandTotalAmount) : "—",
        user_name: voUserName,
        user_address: voUserAddress,
        user_rep: voUserRep,
        user_email: voUserEmail,
        user_contact: voUserContact,
        building: voBuilding,
        premises_address: voPremisesAddress,
        commencement_date: contract.startDate || "TO BE FILLED OUT",
        expiration_date: quotation.lease_term || "TO BE FILLED OUT",
        fixed_fee: voContractFee,
        contract_fee: voContractFee,
        user_signer_name: voSignerName,
        user_signer_address: voSignerAddress,
        user_signer_company: voSignerCompany,
        notary_user_name: voNotaryUserName,
        notary_user_id: voNotaryUserId,
        notary_user_issue: voNotaryUserIssue,
        notary_day: "___",
        notary_month: "________",
        notary_year: new Date().getFullYear().toString(),
        service_name_title: voServiceName,
    };
}

function resolveContractTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, key: string) => variables[key] ?? "—");
}

function buildOtherServiceContractTemplate(): string {
    return [
        "Hero Serviced Office, Inc.",
        "",
        "1. Parties",
        "This {{contract_title_body}} (\"Agreement\") is entered into between Hero PH Inc. (\"Provider\") and {{client_name}}{{company_name_segment}} (\"Client\"), effective as of the date of confirmed payment below.",
        "",
        "2. Service Details",
        "Service: {{service_name}}",
        "Branch: {{branch}}",
        "Package/Plan: {{package}}",
        "Duration: {{duration}}",
        "Start Date: {{start_date}}",
        "",
        "3. Client Information",
        "Client Name: {{client_name}}",
        "Company: {{company_name}}",
        "Signatory: {{signatory_name}}",
        "Email: {{email}}",
        "Phone: {{phone}}",
        "",
        "4. Terms & Conditions",
        "{{terms}}",
        "",
    ].join("\n");
}

function withContractTitleBodyVariable(
    template: string,
    variables: Record<string, string>
): Record<string, string> {
    return {
        ...variables,
        contract_title_body: variables.contract_title || variables.service_name,
    };
}

function buildOtherServiceContractContent(quotation: QuotationPayload): string {
    const variables = withContractTitleBodyVariable(
        buildOtherServiceContractTemplate(),
        buildContractTemplateVariables(quotation)
    );
    return resolveContractTemplate(buildOtherServiceContractTemplate(), variables);
}

function buildServiceContractContentFromAdminTemplate(quotation: QuotationPayload): string {
    return buildOtherServiceContractContent(quotation);
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
        drawLine(label, { size: 9, bold: true, color: COLOR_MUTED, gap: 16, });
        drawLine(value || "—", { size: 11, color: COLOR_TEXT, gap: 20, });
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
    drawLine("Hero Serviced Office, Inc.", { size: 20, bold: true, color: COLOR_PRIMARY, align: "center", gap: 26 });
    drawLine(title, { size: 11, color: COLOR_MUTED, align: "center", gap: 28 });
    drawLine(`Date Issued: ${today}`, { size: 10, gap: 24 });

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
    drawLine("Hero PH Inc.", { bold: true, gap: 40 });
    drawLine("_______________________________", { gap: 14 });
    drawLine("Authorized Representative / Date", { size: 9, color: COLOR_MUTED, gap: 30 });

    drawLine(`${signatoryLabel}`, { bold: true, gap: 40 });
    drawLine("_______________________________", { gap: 14 });
    drawLine("Signature / Date", { size: 9, color: COLOR_MUTED });

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

async function htmlToPdfBuffer(html: string): Promise<Buffer> {
    let browser;

    try {
        const isProduction = process.env.NODE_ENV === "production";

        if (isProduction) {
            // Vercel / serverless
            const chromium = (await import("@sparticuz/chromium")).default;
            const puppeteer = (await import("puppeteer-core")).default;

            const executablePath = await chromium.executablePath();

            console.log("Starting production Chromium:", {
                executablePath,
                isProduction,
            });

            browser = await puppeteer.launch({
                args: [
                    ...chromium.args,
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                ],
                executablePath,
                headless: true,
            });
        } else {
            // Windows / local development
            const puppeteer = (await import("puppeteer")).default;

            console.log("Starting local Puppeteer Chromium");

            browser = await puppeteer.launch({
                headless: true,
            });
        }

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "load",
        });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                right: "15mm",
                bottom: "20mm",
                left: "15mm",
            },
        });

        return Buffer.from(pdf);
    } catch (error) {
        const detail =
            error instanceof Error
                ? error.message
                : String(error);

        console.error(
            "Puppeteer PDF generation failed:",
            error
        );

        throw new Error(
            `Virtual Office contract PDF generation failed: ${detail}`
        );
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error(
                    "Failed to close Puppeteer browser:",
                    closeError
                );
            }
        }
    }
}

async function generateVirtualOfficeContractPdf(
    quotation: QuotationPayload
): Promise<Buffer> {
    const contractHtml = await renderVirtualOfficeContractHtml(quotation);
    return await htmlToPdfBuffer(contractHtml);
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
            Thank you for your interest in Hero Serviced Office, Inc.. We've received your
            ${quotation.service_name.toLowerCase()} request and our team will get back
            to you within <strong>24 business hours</strong>.
        </p>
        ${docCopyLine}
        <table class="detail-table">
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
            `"Hero Serviced Office, Inc." <${process.env.SMTP_USER}>`,
        to: quotation.detail.email,
        subject: `We've received your ${quotation.service_name} request`,
        html: quotationWrapper(body),
        text: `Hi ${firstName},

        Thank you for your ${quotation.service_name} request. Our team will get back to you within 24 business hours.

© ${new Date().getFullYear()} Hero Serviced Office, Inc.`,
        attachments,
    };

    return sendQuotationMailWithErrorHandling(mailOptions);
}

// Branch name -> branch manager email
const BRANCH_MANAGER_EMAIL_MAP: Record<string, string> = {
    "insular life": "insularlife.branch@heroofficesolutions.com",
    "tower 6789": "tower6789.branch@heroofficesolutions.com",
};

function resolveBranchManagerEmail(branch?: string | null): string {
    if (!branch) return "";
    const key = branch.trim().toLowerCase();
    return BRANCH_MANAGER_EMAIL_MAP[key] || "";
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
    const contractRecipients = await getCategoryRecipientList("contract");
    const attachments = [...getDocumentCopyAttachments(options)];
    const contractBuffer = await generateContractPdfByService(quotation);
    const branchManagerEmail = resolveBranchManagerEmail(quotation.branch);

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

    const contractRecipientList = contractRecipients.length > 0
        ? contractRecipients.map((email) => `<li>${email}</li>`).join("")
        : "<li>Contract recipient not configured yet.</li>";

    // For Virtual Office contracts, render the contract document HTML; otherwise use instructions
    let contractContent = "";
    if (isVirtualOfficePaymongo(quotation)) {
        try {
            contractContent = await renderVirtualOfficeContractHtml(quotation);
        } catch (error) {
            console.error("Failed to render VO contract HTML, falling back to instructions", error);
            contractContent = `
                <p style="font-size:15px;line-height:1.8;color:#475569;">
                    Your ${quotation.service_name.toLowerCase()} contract is ready to review. Please see the attached contract document.
                </p>`;
        }
    }

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">Good Day Mr/Ms. ${firstName},</p>
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Your ${quotation.service_name.toLowerCase()} contract is ready to review. We have attached the contract document for your review.
        </p>
        <div style="border-top:1px solid #e5e7eb;padding-top:10px;">
        <h3 style="font-size:16px;font-weight:bold;color:#475569;">Contract Instructions:</h3>
            <ol style="font-size:15px;line-height:1.8;color:#475569;padding-left:20px;">
                <li style="margin-bottom:8px;">Sign every page of the contract, except the last page, as this page is reserved for notarization.</li>
                <li style="margin-bottom:8px;">Once the contract has been signed, please send the completed copy to the appropriate email address:</li>
                <ul style="font-size:15px;line-height:1.8;color:#475569;padding-left:20px;">
                    <li>${branchManagerEmail || "Branch manager email not configured yet."}</li>
                </ul>
                <li>Our representatives will acknowledge receipt once the signed contract has been received.</li>
            </ol>
        </div>`;

    const mailOptions = {
        from: process.env.SMTP_USER ? `"Hero Serviced Office, Inc." <${process.env.SMTP_USER}>` : undefined,
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

    const normalizedBranch = String(quotation.branch || "")
        .trim()
        .toLowerCase();

    const branchManager =
        normalizedBranch.includes("insular") ||
            normalizedBranch === "s02"
            ? RECIPIENTS.branchManagers.S02
            : RECIPIENTS.branchManagers.S01;

    const accountingRecipients = toUniqueEmails([
        RECIPIENTS.accounting,
        RECIPIENTS.accountingofficer,
    ]);

    const salesAndBranchRecipients = toUniqueEmails([
        RECIPIENTS.salesOfficer,
        branchManager,
    ]);

    const attachments = [...getDocumentCopyAttachments(options)];

    const priceBreakdownRows =
        buildQuotationPriceBreakdownRows(quotation);

    const quotationReference =
        quotation.quotation_id ||
        quotation.id ||
        "Not available";

    const frontendBaseUrl = getPublicFrontendBaseUrl();

    const reviewUrl =
        quotation.quotation_id !== undefined &&
            quotation.quotation_id !== null
            ? `${frontendBaseUrl}/quotation/payment-verification?id=${encodeURIComponent(
                String(quotation.quotation_id)
            )}`
            : `${frontendBaseUrl}/quotation/payment-verification`;

    const accountingBody = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Good Day,
        </p>

        <p style="font-size:15px;line-height:1.8;color:#475569;">
            A payment proof has been submitted for
            <strong>${d.full_name}</strong>
            for the
            <strong>${quotation.service_name}</strong>
            quotation.
            Please review the payment details below in the admin workspace
            before verifying the payment.
        </p>

        <p style="text-align:center;margin:24px 0;">
            <a
                href="${reviewUrl}"
                class="email-btn"
            >
                Review Payment
            </a>
        </p>

        <p style="
            font-size:12px;
            color:#94a3b8;
            text-align:center;
            line-height:1.6;
        ">
            Payment status can only be changed after an authenticated review action.
        </p>

        <table class="detail-table">
            ${quotationRow("Client", d.full_name)}
            ${quotationRow("Company", d.company_name)}
            ${quotationRow("Quotation Reference", quotationReference)}
            ${quotationRow("Service", quotation.service_name)}
            ${quotationRow("Email", d.email)}
            ${quotationRow("Phone", formatClickablePhone(d.phone))}
            ${quotationRow("Branch", quotation.branch)}
            ${quotationRow("Payment Method", d.payment_method)}
            ${quotationRow("Reference Number", d.transaction_id)}
            ${quotationRow(
        "Amount Paid / Total",
        d.total != null ? formatCurrency(d.total) : null
    )}
            ${priceBreakdownRows}
        </table>
    `;


    const salesAndBranchBody = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Good Day,
        </p>

        <p style="font-size:15px;line-height:1.8;color:#475569;">
            A payment has been submitted for
            <strong>${d.full_name}</strong>
            for the
            <strong>${quotation.service_name}</strong>
            quotation.
            Payment verification is currently pending review by Accounting.
        </p>

        <table class="detail-table">
            ${quotationRow("Client", d.full_name)}
            ${quotationRow("Company", d.company_name)}
            ${quotationRow("Quotation Reference", quotationReference)}
            ${quotationRow("Service", quotation.service_name)}
            ${quotationRow("Email", d.email)}
            ${quotationRow("Phone", formatClickablePhone(d.phone))}
            ${quotationRow("Branch", quotation.branch)}
            ${quotationRow("Payment Method", d.payment_method)}
            ${quotationRow("Reference Number", d.transaction_id)}
            ${quotationRow(
        "Amount Paid / Total",
        d.total != null ? formatCurrency(d.total) : null
    )}
            ${priceBreakdownRows}
        </table>

        <p style="
            margin-top:24px;
            font-size:13px;
            line-height:1.7;
            color:#64748b;
        ">
            Please note that payment verification can only be completed
            by an authorized Accounting user.
        </p>
    `;

    const accountingMailOptions = {
        from: getSystemMailSender(),
        to: accountingRecipients,
        replyTo: d.email,
        subject: `Payment Verification Required - ${quotation.service_name} quotation`,
        html: quotationWrapper(accountingBody),
        text: `
Payment verification required for ${quotation.service_name} quotation from ${d.full_name}.

Review the payment in the authenticated admin workspace:
${reviewUrl}
        `.trim(),
        attachments,
    };

    const salesAndBranchMailOptions = {
        from: getSystemMailSender(),
        to: salesAndBranchRecipients,
        replyTo: d.email,
        subject: `Payment Submitted - ${quotation.service_name}`,
        html: quotationWrapper(salesAndBranchBody),
        text: `
A payment has been submitted for ${quotation.service_name} quotation from ${d.full_name}.

Quotation Reference: ${quotationReference}
Branch: ${quotation.branch || "Not available"}
Payment Status: Pending Accounting Verification

Payment verification can only be completed by an authorized Accounting user.
        `.trim(),
        attachments,
    };

    const [
        accountingResult,
        salesAndBranchResult,
    ] = await Promise.allSettled([
        transporter
            .sendMail(accountingMailOptions)
            .then((info) => {
                console.log(
                    "Accounting payment verification email:",
                    {
                        messageId: info.messageId,
                        accepted: info.accepted,
                        rejected: info.rejected,
                        pending: info.pending,
                        response: info.response,
                    }
                );

                return info;
            }),

        transporter
            .sendMail(salesAndBranchMailOptions)
            .then((info) => {
                console.log(
                    "Sales + Branch Manager payment notification email:",
                    {
                        messageId: info.messageId,
                        accepted: info.accepted,
                        rejected: info.rejected,
                        pending: info.pending,
                        response: info.response,
                    }
                );

                return info;
            }),
    ]);

    if (accountingResult.status === "rejected") {
        throw accountingResult.reason;
    }

    if (salesAndBranchResult.status === "rejected") {
        throw salesAndBranchResult.reason;
    }

    return {
        success: true,
        accountingMessageId: accountingResult.value.messageId,
        salesAndBranchMessageId: salesAndBranchResult.value.messageId,
    };
}

export async function sendQuotationPaymentVerifiedAdminEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const d = quotation.detail;
    const recipients = getPaymentVerifiedRecipients(quotation.branch);

    if (recipients.length === 0) {
        throw new Error("No active recipients configured for payment-verified notifications.");
    }

    const attachments = [...getDocumentCopyAttachments(options)];
    const priceBreakdownRows = buildQuotationPriceBreakdownRows(quotation);

    const quotationReference =
        quotation.quotation_id ||
        quotation.id ||
        "Not available";

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Good Day,
        </p>

        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Payment has been verified for
            <strong>${d.full_name}</strong>
            for the
            <strong>${quotation.service_name}</strong>
            quotation. This quotation is now marked as
            <strong>paid</strong>.
        </p>

        <table class="detail-table">
            ${quotationRow("Client", d.full_name)}
            ${quotationRow("Company", d.company_name)}
            ${quotationRow("Quotation Reference", quotationReference)}
            ${quotationRow("Service", quotation.service_name)}
            ${quotationRow("Email", d.email)}
            ${quotationRow("Phone", formatClickablePhone(d.phone))}
            ${quotationRow("Branch", quotation.branch)}
            ${quotationRow("Payment Method", d.payment_method)}
            ${quotationRow("Reference Number", d.transaction_id)}
            ${quotationRow(
        "Amount Paid / Total",
        d.total != null ? formatCurrency(d.total) : null
    )}
            ${priceBreakdownRows}
        </table>

        <p style="
            margin-top:24px;
            font-size:13px;
            line-height:1.7;
            color:#64748b;
        ">
            Please proceed with the next steps (e.g. contract preparation) for this client.
        </p>
    `;

    const mailOptions = {
        from: getSystemMailSender(),
        to: recipients,
        replyTo: d.email,
        subject: `Payment Verified - ${quotation.service_name} quotation`,
        html: quotationWrapper(body),
        text: `
Payment verified for ${quotation.service_name} quotation from ${d.full_name}.

Quotation Reference: ${quotationReference}
Branch: ${quotation.branch || "Not available"}
Status: Paid
        `.trim(),
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

    const quotationRecipients = getQuotationRecipients(quotation.branch);

    if (quotationRecipients.length === 0) {
        throw new Error("No active recipients configured for quotation notifications.");
    }

    const englishBody = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            A new ${quotation.service_name.toLowerCase()} quotation request has come in.
        </p>
        <table class="detail-table">
            ${quotationRow("Name", d.full_name)}
            ${quotationRow("Company", d.company_name)}
            ${quotationRow("Email", d.email)}
            ${quotationRow("Phone", formatClickablePhone(d.phone))}
            ${quotationRow("Branch", quotation.branch)}
            ${buildQuotationDetailRows(quotation, {
        formattedDate: true,
    })}
            ${quotationRow("Reference Number", d.transaction_id)}
            ${quotationRow("Receipt File", d.receipt)}
        </table>`;

    const tasks: Promise<unknown>[] = [];

    if (quotationRecipients.length > 0) {
        tasks.push(sendQuotationMailWithErrorHandling({
            from: getSystemMailSender(),
            to: quotationRecipients,
            replyTo: d.email,
            subject: `New ${quotation.service_name} request from ${d.full_name}`,
            html: quotationWrapper(englishBody),
            text: `New ${quotation.service_name} request from ${d.full_name} (${d.email}, ${d.phone}).`,
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
            <a href="${paymentUrl}" class="email-btn">
                Pay Now
            </a>
        </p>
        <p style="font-size:13px;color:#64748b;line-height:1.7;">
            This secure link expires in ${expiresInDays} day${expiresInDays === 1 ? "" : "s"}. If it expires,
            please reply to this email and we will send you a new payment link.
        </p>
        <p class="word-break" style="font-size:12px;color:#64748b;word-break:break-all;margin-top:10px;">${paymentUrl}</p>
    `;

    const mailOptions = {
        from: process.env.SMTP_FROM || `"Hero Serviced Office, Inc." <${process.env.SMTP_USER}>`,
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
        console.log("From:", mailOptions.from);
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