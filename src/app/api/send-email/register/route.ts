import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message } = body

    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f0f4f8;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(13, 71, 161, 0.08); overflow: hidden;">

                <!-- Top accent bar -->
                <tr>
                  <td style="height: 5px; background: linear-gradient(90deg, #0D47A1 0%, #1565C0 60%, #FFC107 100%); font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>

                <!-- Header -->
                <tr>
                  <td style="background-color: #0D47A1; padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                      Hero Serviced Office
                    </h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.75); font-size: 13px; letter-spacing: 0.5px;">
                      Customer Communication
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 36px;">
                    <h2 style="margin: 0 0 20px 0; color: #0D47A1; font-size: 20px; font-weight: 700;">
                      ${subject}
                    </h2>
                    <div style="color: #4a5568; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
                      ${message}
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8faff; padding: 28px 36px; text-align: center; border-top: 1px solid #e8edf5;">
                    <p style="margin: 0 0 8px 0; color: #6b7a99; font-size: 13px;">
                      This email was sent from Hero Serviced Office
                    </p>
                    <p style="margin: 0; color: #9aa5b4; font-size: 11px; letter-spacing: 0.3px;">
                      © ${new Date().getFullYear()} Hero Serviced Office. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: message,
      html: htmlContent,
    })

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("[API] Error sending email:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    )
  }
}