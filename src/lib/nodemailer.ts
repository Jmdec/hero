import nodemailer from "nodemailer";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
} from "docx";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

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
            body{
                margin:0;
                padding:0;
                background:#f4f7fb;
                font-family:Arial,Helvetica,sans-serif;
            }
            </style>
            </head>

            <body>

            <div style="background:#f4f7fb;padding:40px 20px;">

            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8edf5;">

            <div style="height:6px;background:#0D47A1;"></div>

            <div style="padding:40px;text-align:center;">

            <h1 style="margin:0;font-size:28px;color:#0D47A1;">
            Hero Serviced Office
            </h1>

            <p style="margin-top:8px;color:#64748b;font-size:15px;">
            Your Workspace for Success.
            </p>

            </div>

            <div style="padding:0 40px 40px;">

            <h2 style="margin:0 0 20px;color:#1e293b;">
            Welcome, ${name}!
            </h2>

            <p style="font-size:15px;line-height:1.8;color:#475569;">
            Thank you for creating your Hero Serviced Office account.
            Before you can access your account, please verify your email address by clicking the button below.
            </p>

            <div style="text-align:center;margin:40px 0;">

            <a
            href="${verificationUrl}"
            style="
            display:inline-block;
            padding:16px 36px;
            background:#0D47A1;
            color:#ffffff;
            text-decoration:none;
            font-weight:bold;
            border-radius:8px;
            font-size:15px;
            ">
            Verify Email
            </a>

            </div>

            <p style="font-size:13px;color:#64748b;line-height:1.7;">
            If the button doesn't work, copy and paste this link into your browser:
            </p>

            <p style="
            font-size:12px;
            word-break:break-all;
            background:#f8fafc;
            padding:12px;
            border-radius:6px;
            color:#0D47A1;
            ">
            ${verificationUrl}
            </p>

            <p style="margin-top:30px;font-size:13px;color:#64748b;">
            If you didn't create an account, you can safely ignore this email.
            </p>

            </div>

            <div style="
            background:#f8fafc;
            padding:20px;
            text-align:center;
            font-size:12px;
            color:#94a3b8;
            ">

            © ${new Date().getFullYear()} Hero Serviced Office<br>
            All rights reserved.

            </div>

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

        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("EAUTH")) {
                throw new Error(
                    "SMTP authentication failed. Check your email and App Password."
                );
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

export interface QuotationPriceBreakdown {
    package_base_monthly?: number | null;
    vat_monthly?: number | null;
    monthly_subtotal?: number | null;
    months?: number | null;
    recurring_total?: number | null;
    contract_admin_fee?: number | null;
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
    other_requirements?: string | null;
    months?: number | null;
    price_breakdown?: QuotationPriceBreakdown | null;
    total?: number;
}

export interface QuotationPayload {
    service_id?: number | null;
    service_name: string;
    branch?: string | null;
    lease_term?: string | null;
    package?: string | null;
    event_type?: string | null;
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
}

const VO_PACKAGE_PRICES: Record<string, number> = { Basic: 2000, Standard: 3000, Premium: 5000 };
const VO_VAT_RATE = 0.12;
const VO_CONTRACT_ADMIN_FEE = 500;

/** Only enabled VO payment methods. Cash / cheque are no longer accepted. */
const VO_ENABLED_PAYMENT_METHODS = new Set(["qrph", "online_transfer", "bank"]);

function peso(n: number | null | undefined): string {
    const value = n ?? 0;
    return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Recomputes the VO pricing breakdown server-side (Package + VAT + Contract & Admin Fee,
 * multiplied by Duration) so email/contract totals never trust unvalidated client input.
 */
function computeVirtualOfficeTotal(pkg: string | null | undefined, months: number | null | undefined) {
    const base = VO_PACKAGE_PRICES[pkg || ""] ?? 0;
    const vat = base * VO_VAT_RATE;
    const monthlySubtotal = base + vat;
    const numMonths = Math.max(1, months || 1);
    const recurring = monthlySubtotal * numMonths;
    const total = recurring + VO_CONTRACT_ADMIN_FEE;
    return { base, vat, monthlySubtotal, numMonths, recurring, contractAdminFee: VO_CONTRACT_ADMIN_FEE, total };
}

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
    const labels: Record<string, string> = {
        qrph: "QRPH",
        online_transfer: "Online Bank Transfer",
        bank: "Bank Deposit",
    };
    return labels[value] ?? value
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
    const isVirtualOffice = isVirtualOfficeQuotation(q);
    const seatsRow = options.hideSeatsForVirtualOffice && isVirtualOffice
        ? ""
        : quotationRow("Seats / Attendees", d.seats);
    const dateValue = options.formattedDate ? formatQuotationDate(d.date) : d.date;

    const pricingRows = isVirtualOffice
        ? (() => {
            const b = computeVirtualOfficeTotal(q.package, d.months);
            return [
                quotationRow("Months Duration", d.months ? `${d.months} ${d.months === 1 ? "month" : "months"}` : null),
                quotationRow("Package (Monthly)", peso(b.base)),
                quotationRow("VAT (12%, Monthly)", peso(b.vat)),
                quotationRow("Contract & Admin Fee", peso(b.contractAdminFee)),
                quotationRow("Total Amount Due", peso(b.total)),
            ].join("");
        })()
        : "";

    return [
        quotationRow("Service", q.service_name),
        quotationRow("Package", q.package),
        quotationRow("Lease Term", q.lease_term),
        quotationRow("Event Type", q.event_type),
        seatsRow,
        quotationRow("Date", dateValue),
        quotationRow("Time", d.time),
        quotationRow("Duration", d.duration_type),
        pricingRows,
        quotationRow("Other Requirements", d.other_requirements),
        quotationRow("Notes", d.request),
        quotationRow("Payment Method", formatPaymentMethodLabel(d.payment_method)),
        quotationRow("ID Type", d.id_type),
        quotationRow("ID Number", d.id_number),
        quotationRow("ID Name", d.id_name),
        quotationRow("ID Address", d.id_address),
        quotationRow("Signatory", d.signatory_details),
    ].join("");
}

function quotationWrapper(title: string, bodyHtml: string): string {
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
          <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">${title}</h2>
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

function isVirtualOfficeQuotation(
    quotation: QuotationPayload
): boolean {
    const service = quotation.service_name?.toLowerCase() ?? "";

    return service.includes("virtual office");
}

const RECIPIENTS = {
    salesOfficer: process.env.SALES_OFFICER_EMAIL || "sales.officer.mock@hero-office.test",
    digitalMarketing: process.env.DIGITAL_MARKETING_EMAIL || "digital.marketing.mock@hero-office.test",
    generalManager: process.env.GENERAL_MANAGER_EMAIL || "general.manager.mock@hero-office.test",
    accounting: process.env.ACCOUNTING_EMAIL || "accounting.mock@hero-office.test",
    branchManagers: {
        S01: process.env.BRANCH_MANAGER_S01_EMAIL || "tower6789.manager.mock@hero-office.test",
        S02: process.env.BRANCH_MANAGER_S02_EMAIL || "insular.manager.mock@hero-office.test",
    },
};

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

function resolveBranchCode(branch: string | null | undefined): "S01" | "S02" {
    const normalized = (branch || "").toLowerCase();
    if (
        normalized.includes("insular") ||
        normalized.includes("s02")
    ) {
        return "S02";
    }
    return "S01";
}

function getSignedContractRouting(quotation: QuotationPayload) {
    const branchCode = resolveBranchCode(quotation.branch);
    const to = RECIPIENTS.branchManagers[branchCode];
    const cc = toUniqueEmails([
        RECIPIENTS.salesOfficer,
        RECIPIENTS.digitalMarketing,
    ]);

    return { branchCode, to, cc };
}

function getCoreStakeholderRecipients(quotation: QuotationPayload): string[] {
    const routing = getSignedContractRouting(quotation);
    return toUniqueEmails([
        routing.to,
        RECIPIENTS.salesOfficer,
        RECIPIENTS.digitalMarketing,
        RECIPIENTS.generalManager,
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
    if (!isVirtualOfficeQuotation(quotation)) return false;

    const hasPaymentEvidence = hasPaymentCopy(options) || Boolean(quotation.detail.receipt);
    const hasGovernmentEvidence = hasGovernmentIdCopy(options) || Boolean(quotation.detail.government_id_file);

    return hasPaymentEvidence && hasGovernmentEvidence;
}

// ─── Virtual Office Contract (.docx) — admin/internal use only ────────────────
//
// Per updated workflow, the formal contract is NOT sent to the client at
// submission time. Admin verifies payment first, then formally contacts the
// client directly to finalize the contract. This .docx is generated solely
// as a reference document attached to the ADMIN notification email.

const DOCX_COLOR_PRIMARY = "0D47A1";
const DOCX_COLOR_MUTED = "94A3B8";
const DOCX_COLOR_TEXT = "1E293B";

function sanitizeDocxText(text: string) {
    return text.replace(/₱/g, "PHP ");
}

function heading(text: string) {
    return new Paragraph({
        text: sanitizeDocxText(text),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        run: { color: DOCX_COLOR_PRIMARY, bold: true, size: 24 },
    } as any);
}

function bodyLine(label: string, value: string) {
    return new Paragraph({
        spacing: { after: 60 },
        children: [
            new TextRun({ text: `${label}: `, bold: true, color: DOCX_COLOR_TEXT, size: 20 }),
            new TextRun({ text: sanitizeDocxText(value || "—"), color: DOCX_COLOR_TEXT, size: 20 }),
        ],
    });
}

function paragraphText(text: string) {
    return new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({ text: sanitizeDocxText(text), color: DOCX_COLOR_TEXT, size: 20 })],
    });
}

/**
 * Generates a Virtual Office service agreement as a .docx buffer (using the
 * `docx` package) for internal admin reference. Replaces the previous
 * pdf-lib PDF generator — the client no longer receives this document.
 */
async function generateVirtualOfficeContractDocx(
    quotation: QuotationPayload
): Promise<Buffer> {
    const d = quotation.detail;
    const pricing = computeVirtualOfficeTotal(quotation.package, d.months);
    const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    const idName = d.id_name || d.full_name;
    const signatoryLabel = d.signatory_details || idName;
    const paymentMethodLabel = formatPaymentMethodLabel(d.payment_method);
    const formattedStartDate = formatDisplayDate(d.date);

    const pricingTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "D9E2F0" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "D9E2F0" },
            left: { style: BorderStyle.SINGLE, size: 2, color: "D9E2F0" },
            right: { style: BorderStyle.SINGLE, size: 2, color: "D9E2F0" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D9E2F0" },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "D9E2F0" },
        },
        rows: [
            ["Package (Monthly)", peso(pricing.base)],
            ["VAT (12%, Monthly)", peso(pricing.vat)],
            ["Monthly Subtotal", peso(pricing.monthlySubtotal)],
            ["Duration", `${pricing.numMonths} ${pricing.numMonths === 1 ? "month" : "months"}`],
            ["Recurring Subtotal", peso(pricing.recurring)],
            ["Contract & Admin Fee", peso(pricing.contractAdminFee)],
            ["Total Amount Due", peso(pricing.total)],
        ].map(([label, value], i) => new TableRow({
            children: [
                new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: label, bold: i === 6, size: 20 })] })],
                }),
                new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: sanitizeDocxText(value), bold: i === 6, size: 20 })] })],
                }),
            ],
        })),
    });

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 40 },
                        children: [new TextRun({ text: "Hero Serviced Office", bold: true, size: 36, color: DOCX_COLOR_PRIMARY })],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                        children: [new TextRun({ text: "Virtual Office Service Agreement", size: 22, color: DOCX_COLOR_MUTED })],
                    }),
                    paragraphText(`Date Issued: ${today}`),

                    heading("1. Parties"),
                    paragraphText(
                        `This Virtual Office Service Agreement ("Agreement") is entered into between Hero PH Inc. ("Provider") and ${d.full_name}${d.company_name ? ` of ${d.company_name}` : ""
                        } ("Client"), effective as of the date of confirmed payment below.`
                    ),

                    heading("2. Service Details"),
                    bodyLine("Service", quotation.service_name || "Virtual Office"),
                    ...(quotation.branch ? [bodyLine("Branch", quotation.branch)] : []),
                    bodyLine("Package", quotation.package || "—"),
                    bodyLine("Start Date", formattedStartDate),
                    bodyLine("Payment Method", paymentMethodLabel),
                    ...(d.transaction_id ? [bodyLine("Transaction ID", d.transaction_id)] : []),

                    heading("3. Pricing Breakdown"),
                    pricingTable,

                    heading("4. Client Information"),
                    bodyLine("Name", idName),
                    ...(d.id_type ? [bodyLine("ID Type", d.id_type)] : []),
                    ...(d.id_number ? [bodyLine("ID Number", d.id_number)] : []),
                    ...(d.company_name ? [bodyLine("Company", d.company_name)] : []),
                    ...(d.id_address ? [bodyLine("Address", d.id_address)] : []),
                    ...(d.signatory_details ? [bodyLine("Signatory Details", d.signatory_details)] : []),
                    bodyLine("Email", d.email),
                    bodyLine("Phone", d.phone),

                    heading("5. Terms & Conditions"),
                    paragraphText(
                        "The Client agrees to the Provider's standard terms of service, including monthly billing, renewal, and cancellation policies as outlined in the Provider's Terms of Use. This Agreement takes effect upon confirmed payment and remains in force on a month-to-month basis unless terminated by either party with thirty (30) days' written notice. All correspondence regarding this Agreement should be directed to salesofficer@heroph.net."
                    ),

                    new Paragraph({ spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "Hero PH Inc.", bold: true, size: 20 })] }),
                    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "_______________________________", size: 20 })] }),
                    new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "Authorized Representative", size: 18, color: DOCX_COLOR_MUTED })] }),

                    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: sanitizeDocxText(signatoryLabel), bold: true, size: 20 })] }),
                    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "_______________________________", size: 20 })] }),
                    new Paragraph({ children: [new TextRun({ text: "Client Signature", size: 18, color: DOCX_COLOR_MUTED })] }),

                    new Paragraph({
                        spacing: { before: 400 },
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({
                            text: "23F TOWER6789, Ayala Avenue 6789, Makati City 1209, Philippines · salesofficer@heroph.net",
                            size: 16,
                            color: DOCX_COLOR_MUTED,
                        })],
                    }),
                ],
            },
        ],
    });

    return Packer.toBuffer(doc);
}

// ─── User & Admin Notification Emails ───────────────────────────────────────

/**
 * Client-facing confirmation email. Per updated workflow, this NEVER includes
 * the formal contract — only the admin receives that document. Client still
 * gets acknowledgement of their request and (if applicable) their payment.
 */
export async function sendQuotationUserEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const firstName = quotation.detail.full_name.split(" ")[0] || quotation.detail.full_name;
    const qualifiesForContract = isVirtualOfficeQuotation(quotation);
    const documentCopies = getDocumentCopyAttachments(options);

    // Contract .docx is intentionally NOT attached here — admin-only, per
    // updated workflow (client is formally contacted directly by admin
    // after payment verification instead of receiving an auto-generated contract).
    const attachments: {
        filename: string;
        content: Buffer;
        contentType: string;
    }[] = [...documentCopies];

    const contractLine = qualifiesForContract
        ? `<p style="font-size:15px;line-height:1.8;color:#475569;">Our admin team will verify your submitted payment and documents, then formally contact you directly to finalize your contract.</p>`
        : "";

    const docCopyLine = documentCopies.length > 0
        ? `<p style="font-size:13px;color:#64748b;line-height:1.7;margin-top:16px;">Copies of your uploaded payment proof and ID documents are attached for your records.</p>`
        : "";

    const paymentAcknowledgementLine = hasPaymentCopy(options)
        ? `<p style="font-size:15px;line-height:1.8;color:#475569;">We acknowledge receipt of your submitted payment proof. Our team will verify it and proceed with your request.</p>`
        : "";

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">Hi ${firstName},</p>
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            Thank you for your interest in Hero Serviced Office. We've received your
            ${quotation.service_name.toLowerCase()} request and our team will get back
            to you within <strong>24 business hours</strong>.
        </p>
        ${paymentAcknowledgementLine}
        ${contractLine}
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
        html: quotationWrapper("Thank You!", body),
        text: `Hi ${firstName},

        Thank you for your ${quotation.service_name} request. Our team will get back to you within 24 business hours.

© ${new Date().getFullYear()} Hero Serviced Office`,
        attachments,
    };

    return sendQuotationMailWithErrorHandling(mailOptions);
}

/**
 * Admin/internal notification email. This is the ONLY recipient of the
 * generated Virtual Office contract, now produced as a .docx (Word)
 * document instead of PDF, once both payment proof and government ID are on file.
 */
export async function sendQuotationAdminEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const d = quotation.detail;
    const stakeholders = getCoreStakeholderRecipients(quotation);
    const attachments = getDocumentCopyAttachments(options);
    const readyForContract = canGenerateContract(quotation, options);

    console.log("===== Contract Check (admin-only, .docx) =====");
    console.log("Service:", quotation.service_name);
    console.log("Payment:", quotation.detail.payment_method);
    console.log("Ready for contract:", readyForContract);

    if (readyForContract) {
        try {
            const contractBuffer = await generateVirtualOfficeContractDocx(quotation);

            console.log("Contract .docx generated successfully:", contractBuffer.length, "bytes");

            attachments.push({
                filename: "Hero-Virtual-Office-Contract.docx",
                content: contractBuffer,
                contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
        } catch (error) {
            console.error("Failed to generate admin contract .docx:", error);
        }
    }

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            A new ${quotation.service_name.toLowerCase()} quotation request has come in.
        </p>
        ${readyForContract
            ? `<p style="font-size:13px;color:#64748b;line-height:1.7;">The draft contract (.docx) is attached for your reference. This has NOT been sent to the client — please verify payment and formally contact the client directly.</p>`
            : ""
        }
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
            ${quotationRow("Name", d.full_name)}
            ${quotationRow("Company", d.company_name)}
            ${quotationRow("Email", d.email)}
            ${quotationRow("Phone", d.phone)}
            ${quotationRow("Branch", quotation.branch)}
            ${buildQuotationDetailRows(quotation, {
                formattedDate: true,
            })}
            ${quotationRow("Transaction ID", d.transaction_id)}
            ${quotationRow("Receipt File", d.receipt)}
            ${quotationRow("Government ID File", d.government_id_file)}
            ${quotationRow("Signatory ID File", d.signatory_id_file)}
        </table>`;

    const configuredAdmins = parseRecipientList(process.env.ADMIN_NOTIFICATION_EMAILS);
    const adminEmails = configuredAdmins.length > 0
        ? toUniqueEmails([...configuredAdmins, ...stakeholders])
        : toUniqueEmails(stakeholders);

    const mailOptions = {
        from: process.env.SMTP_FROM || `"Hero Serviced Office" <${process.env.SMTP_USER}>`,
        to: adminEmails,
        replyTo: d.email,
        subject: `New ${quotation.service_name} request from ${d.full_name}`,
        html: quotationWrapper("New Quotation Request", body),
        text: `New ${quotation.service_name} request from ${d.full_name} (${d.email}, ${d.phone}).`,
        attachments,
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
    // Guard: if a Virtual Office quotation somehow carries a disabled payment
    // method (cash/cheque/etc.), don't silently accept it here — the client
    // form should already restrict this, but the server enforces it too.
    if (isVirtualOfficeQuotation(quotation) && quotation.detail.payment_method) {
        if (!VO_ENABLED_PAYMENT_METHODS.has(quotation.detail.payment_method)) {
            console.warn(
                `Virtual Office quotation submitted with disabled payment method: ${quotation.detail.payment_method}`
            );
        }
    }

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