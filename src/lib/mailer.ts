import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST;
const smtpPort = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true" || process.env.MAIL_SECURE === "true" || smtpPort === 465;
const smtpUser = process.env.SMTP_USER || process.env.MAIL_USERNAME;
const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: !smtpSecure && (process.env.SMTP_ENCRYPTION || process.env.MAIL_ENCRYPTION) === "tls",
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

export async function sendMail({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}) {
  return transporter.sendMail({
    from:
      process.env.MAIL_FROM ||
      process.env.SMTP_FROM ||
      process.env.MAIL_FROM_ADDRESS ||
      `"Hero Serviced Office, Inc." <${smtpUser}>`,
    to,
    subject,
    html,
    text,
    replyTo,
    attachments,
  });
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

export function getAdminNotificationRecipients(): string[] {
  const list: string[] = [];

  const primary = (process.env.HERO_ADMIN_EMAILS || process.env.HERO_ADMIN_EMAIL || process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER || "").toString();
  if (primary) {
    list.push(...primary.split(/[;,]+/));
  }

  const roleEmails = [
    process.env.CHAIRMAN_EMAIL || process.env.CONTACT_INQUIRY_CHAIRMAN_EMAIL || process.env.QUOTATION_CHAIRMAN_EMAIL,
    process.env.PRESIDENT_EMAIL || process.env.CONTACT_INQUIRY_PRESIDENT_EMAIL || process.env.QUOTATION_PRESIDENT_EMAIL,
    process.env.GENERAL_MANAGER_EMAIL,
    process.env.SALES_OFFICER_EMAIL,
    process.env.DIGITAL_MARKETING_EMAIL,
    process.env.ACCOUNTING_EMAIL,
    process.env.BRANCH_MANAGER_S01_EMAIL,
    process.env.BRANCH_MANAGER_S02_EMAIL,
  ];

  for (const e of roleEmails) {
    if (e && typeof e === "string" && e.trim() !== "") list.push(e);
  }

  return toUniqueEmails(list);
}

export function getAdminNotificationRecipientsString(): string {
  return getAdminNotificationRecipients().join(", ");
}

export default getAdminNotificationRecipients;

export async function sendMailToAdmins({
  subject,
  html,
  text,
  replyTo,
}: {
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  const recipients = getAdminNotificationRecipients();
  if (recipients.length === 0) return null;

  return sendMail({
    to: recipients.join(", "),
    subject,
    html,
    text,
    replyTo,
  });
}

