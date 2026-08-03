import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";

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

    if (!hasPrice) {
        return "";
    }

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
        quotationRow("Total", d.total != null ? formatCurrency(d.total) : undefined)
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
    president: process.env.QUOTATION_PRESIDENT_EMAIL || process.env.CONTACT_INQUIRY_PRESIDENT_EMAIL || process.env.PRESIDENT_EMAIL || "president.mock@hero-office.test",
    salesOfficer: process.env.SALES_OFFICER_EMAIL || "sales.officer.mock@hero-office.test",
    digitalMarketing: process.env.DIGITAL_MARKETING_EMAIL || "eirenegrc.armilla@gmail.com",
    generalManager: process.env.GENERAL_MANAGER_EMAIL || "general.manager.mock@hero-office.test",
    accounting: process.env.ACCOUNTING_EMAIL || "accounting.mock@hero-office.test",
    branchManagers: {
        S01: process.env.BRANCH_MANAGER_S01_EMAIL || "tower6789.manager.mock@hero-office.test",
        S02: process.env.BRANCH_MANAGER_S02_EMAIL || "insular.manager.mock@hero-office.test",
    },
};

function getPublicAppBaseUrl(): string {
    const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    if (!configuredBaseUrl) {
        return "http://localhost:3000";
    }

    return configuredBaseUrl.replace(/\/$/, "");
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
    return text.replace(/₱/g, "PHP ");
}

/**
 * Generates a simple Virtual Office service agreement as a PDF buffer,
 * using pdf-lib (pure JS, embedded standard fonts — no filesystem font
 * lookups, so it works reliably in Next.js serverless/Vercel builds where
 * pdfkit's .afm font loading tends to fail silently).
 */
async function generateVirtualOfficeContractPdf(
    quotation: QuotationPayload
): Promise<Buffer> {
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

    const sectionTitle = (title: string) => {
        cursorY -= 8;
        drawLine(title, { size: 12, bold: true, color: COLOR_PRIMARY, gap: 18 });
    };

    const d = quotation.detail;
    const monthlyFee = VO_PACKAGE_PRICES[quotation.package || ""] ?? "—";
    const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    const idName = d.id_name || d.full_name;
    const signatoryLabel = d.signatory_details || idName;
    const paymentMethodLabel = formatPaymentMethodLabel(d.payment_method);
    const formattedStartDate = formatDisplayDate(d.date);

    // --- VAT / subtotal computation ---
    const VAT_RATE = 0.12; // 12% PH VAT
    const parseAmount = (value: string): number | null => {
        const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
        return Number.isFinite(numeric) ? numeric : null;
    };
    const formatCurrency = (value: number): string =>
        `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const monthlyFeeAmount = parseAmount(monthlyFee);
    let vatAmountLabel = "—";
    let subtotalLabel = "—";
    let totalPerMonthLabel = "—";

    if (monthlyFeeAmount !== null) {
        // Treat the listed package price as VAT-inclusive; back out the subtotal and VAT.
        const subtotal = monthlyFeeAmount / (1 + VAT_RATE);
        const vatAmount = monthlyFeeAmount - subtotal;

        subtotalLabel = formatCurrency(subtotal);
        vatAmountLabel = formatCurrency(vatAmount);
        totalPerMonthLabel = formatCurrency(monthlyFeeAmount);
    }

    const durationLabel = d.duration || quotation.duration || "Month-to-month";

    drawLine("Hero Serviced Office", { size: 20, bold: true, color: COLOR_PRIMARY, align: "center", gap: 26 });
    drawLine("Virtual Office Service Agreement", { size: 11, color: COLOR_MUTED, align: "center", gap: 28 });

    drawLine(`Date Issued: ${today}`, { size: 10, gap: 20 });

    sectionTitle("1. Parties");
    drawParagraph(
        `This Virtual Office Service Agreement ("Agreement") is entered into between Hero PH Inc. ("Provider") and ${d.full_name}${d.company_name ? ` of ${d.company_name}` : ""
        } ("Client"), effective as of the date of confirmed payment below.`
    );

    sectionTitle("2. Service Details");
    drawLine(`Service: ${quotation.service_name || "Virtual Office"}`);
    if (quotation.branch) drawLine(`Branch: ${quotation.branch}`);
    drawLine(`Package: ${quotation.package || "—"}`);
    drawLine(`Duration: ${durationLabel}`);
    drawLine(`Start Date: ${formattedStartDate}`);
    drawLine(`Subtotal (Monthly, VAT-exclusive): ${subtotalLabel}`);
    drawLine(`VAT (12%): ${vatAmountLabel}`);
    drawLine(`Monthly Fee (VAT-inclusive): ${totalPerMonthLabel}`);
    drawLine(`Payment Method: ${paymentMethodLabel}`);
    if (d.transaction_id) drawLine(`Reference No: ${d.transaction_id}`);

    sectionTitle("3. Client Information");
    drawLine(`Name: ${idName}`);
    if (d.id_type) drawLine(`ID Type: ${d.id_type}`);
    if (d.id_number) drawLine(`ID Number: ${d.id_number}`);
    if (d.company_name) drawLine(`Company: ${d.company_name}`);
    if (d.id_address) drawLine(`Address: ${d.id_address}`);
    if (d.signatory_details) drawLine(`Signatory Details: ${d.signatory_details}`);
    drawLine(`Email: ${d.email}`);
    drawLine(`Phone: ${d.phone}`);

    sectionTitle("4. Terms & Conditions");
    drawParagraph(
        "The Client agrees to the Provider's standard terms of service, including monthly billing, renewal, and cancellation policies as outlined in the Provider's Terms of Use. This Agreement takes effect upon confirmed payment and remains in force on a month-to-month basis unless terminated by either party with thirty (30) days' written notice. All correspondence regarding this Agreement should be directed to salesofficer@heroph.net."
    );

    cursorY -= 40;
    drawLine("Hero PH Inc.", { bold: true, gap: 40 });
    drawLine("_______________________________", { gap: 14 });
    drawLine("Authorized Representative", { gap: 40 });

    drawLine(`${signatoryLabel}`, { bold: true, gap: 40 });
    drawLine("_______________________________", { gap: 14 });
    drawLine("Client Signature");

    ensureSpace(30);
    drawLine(
        "23F TOWER6789, Ayala Avenue 6789, Makati City 1209, Philippines · salesofficer@heroph.net",
        { size: 8, color: COLOR_MUTED, align: "center" }
    );

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
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
        ${signatoryLine}
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
    const attachments = [...getDocumentCopyAttachments(options)];
    const shouldAttachContract = isVirtualOfficePaymongo(quotation);

    if (shouldAttachContract) {
        try {
            const contractBuffer = await generateVirtualOfficeContractPdf(quotation);
            attachments.push({
                filename: "Hero-Virtual-Office-Contract.pdf",
                content: contractBuffer,
                contentType: "application/pdf",
            });
        } catch (error) {
            console.error("Failed to generate contract email attachment:", error);
        }
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
            ${quotationRow("取引ID", d.transaction_id)}
            ${quotationRow("領収書ファイル", d.receipt)}
            ${quotationRow("政府発行IDファイル", d.government_id_file)}
            ${quotationRow("署名者IDファイル", d.signatory_id_file)}
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
    // If configured, delegate email sending to the Laravel backend endpoints
    const useBackend = process.env.NEXT_PUBLIC_USE_BACKEND_EMAIL === 'true' || process.env.USE_BACKEND_EMAIL === 'true';

    if (useBackend) {
        const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '').replace(/\/$/, '') || undefined;
        if (!backendBase) {
            console.warn('BACKEND URL not configured; falling back to local nodemailer.');
        } else {
            try {
                // If the quotation payload includes an `id`, tell the backend to send emails for that quotation
                // otherwise attempt to POST the payload to /api/quotations and ask the backend to send notifications.
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