import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

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
            Professional Workspace Solutions
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