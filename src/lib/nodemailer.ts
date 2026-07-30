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
    other_requirements?: string | null;
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
        quotationRow("Payment Method", d.payment_method),
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

function isVirtualOfficePaymongo(
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
    drawLine(`Monthly Fee: ${monthlyFee}/month`);
    drawLine(`Start Date: ${formattedStartDate}`);
    drawLine(`Payment Method: ${paymentMethodLabel}`);
    if (d.transaction_id) drawLine(`Transaction ID: ${d.transaction_id}`);

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

// ─── User & Admin Notification Emails ───────────────────────────────────────

export async function sendQuotationUserEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const firstName = quotation.detail.full_name.split(" ")[0] || quotation.detail.full_name;
    const qualifiesForContract = isVirtualOfficePaymongo(quotation);
    const readyForContract = canGenerateContract(quotation, options);
    const documentCopies = getDocumentCopyAttachments(options);

    let attachments:
        | {
            filename: string;
            content: Buffer;
            contentType: string;
        }[]
        = [...documentCopies];

    let contractAttached = false;

    console.log("===== Contract Check =====");
    console.log("Service:", quotation.service_name);
    console.log("Payment:", quotation.detail.payment_method);
    console.log("Qualifies:", qualifiesForContract);

    if (readyForContract) {
        try {
            const pdfBuffer = await generateVirtualOfficeContractPdf(quotation);

            console.log(
                "PDF generated successfully:",
                pdfBuffer.length,
                "bytes"
            );

            attachments.push({
                filename: "Hero-Virtual-Office-Contract.pdf",
                content: pdfBuffer,
                contentType: "application/pdf",
            });

            contractAttached = true;
        } catch (error) {
            console.error(
                "Failed to generate contract PDF:",
                error
            );
        }
    }

    console.log("Attachments:", attachments?.length ?? 0);

    const contractLine = contractAttached
        ? `<p style="font-size:15px;line-height:1.8;color:#475569;">Attached to this email is your quotation contract in PDF format, with your submitted client information already completed for your review.</p>`
        : qualifiesForContract
            ? `<p style="font-size:15px;line-height:1.8;color:#475569;">Contract generation is queued. We can generate and send the contract after both your proof of payment and government ID copies are uploaded.</p>`
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

export async function sendQuotationAdminEmail(
    quotation: QuotationPayload,
    options: QuotationNotificationOptions = {}
) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials are not configured.");
    }

    const d = quotation.detail;
    const stakeholders = getCoreStakeholderRecipients(quotation);
    const signedContractRouting = getSignedContractRouting(quotation);
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

    const body = `
        <p style="font-size:15px;line-height:1.8;color:#475569;">
            A new ${quotation.service_name.toLowerCase()} quotation request has come in.
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