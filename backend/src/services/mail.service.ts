import axios from "axios";

const MAILER_API_URL = "https://mailer-silk.vercel.app/api/send-email";

/**
 * Formats plain text or HTML content into a professional email template
 */
function formatMessMailerHtml(subject: string, content: string): string {
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }

  const paragraphs = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">${line}</p>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f9; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;" cellspacing="0" cellpadding="0" border="0">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Mess Meal Manager</h1>
              <p style="margin: 6px 0 0; color: #ccfbf1; font-size: 14px; font-weight: 400;">Smart Meal & Expense Settlement System</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; font-weight: 600;">${subject}</h2>
              ${paragraphs}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} <strong>Mess Meal Manager</strong>. All rights reserved.<br>
                If you did not request this email, please ignore it or contact support.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendAccountEmail(input: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<boolean> {
  try {
    const payload: {
      to: string;
      subject: string;
      text?: string;
      html?: string;
    } = {
      to: input.to,
      subject: input.subject,
    };

    if (input.text) {
      payload.text = input.text;
    }

    if (input.html) {
      payload.html = input.html;
    } else if (input.text) {
      payload.html = formatMessMailerHtml(input.subject, input.text);
    }

    const response = await axios.post(MAILER_API_URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15_000,
    });

    console.log(
      `[Mailer Service] Email sent to ${input.to} via Mailer API. Status: ${response.status}`,
    );
    return response.status >= 200 && response.status < 300;
  } catch (error: any) {
    console.error(
      "[Mailer Service] Failed to send email via Mailer API:",
      error?.response?.data || error?.message || error,
    );
    return false;
  }
}
