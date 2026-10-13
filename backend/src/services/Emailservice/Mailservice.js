
import { sendMail } from "./Mailer.js";

const BRAND_NAME = process.env.MAIL_BRAND_NAME || "CyvoraTech";
const LOGO_URL = process.env.MAIL_LOGO_URL || "";

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const layout = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#242b36;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
    style="background:#f5f6f8;padding:32px 12px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
          style="max-width:520px;background:#ffffff;border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td style="padding:22px 28px;border-bottom:1px solid #e5e7eb;">
              ${
                LOGO_URL
                  ? `<img src="${escapeHtml(LOGO_URL)}"
                      alt="${escapeHtml(BRAND_NAME)}"
                      width="125"
                      style="display:block;width:125px;max-width:100%;height:auto;border:0;">`
                  : `<span style="font-size:18px;font-weight:700;color:#1f2937;">${escapeHtml(BRAND_NAME)}</span>`
              }
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px 28px;">

              <h1 style="margin:0 0 20px;font-size:22px;line-height:1.4;font-weight:600;color:#1f2937;">
                ${escapeHtml(title)}
              </h1>

              <div style="font-size:14px;line-height:1.8;color:#4b5563;">
                ${body}
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px;background:#fafafa;border-top:1px solid #e5e7eb;">

              <p style="margin:0 0 12px;font-size:12px;line-height:1.7;color:#6b7280;">
                If you need assistance, please contact your administrator.
              </p>

              ${
                LOGO_URL
                  ? `<img src="${escapeHtml(LOGO_URL)}"
                      alt="${escapeHtml(BRAND_NAME)}"
                      width="90"
                      style="display:block;width:90px;max-width:100%;height:auto;border:0;margin:0 0 12px;">`
                  : `<p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#374151;">${escapeHtml(BRAND_NAME)}</p>`
              }

              <p style="margin:0;font-size:11px;line-height:1.6;color:#9ca3af;">
                Automated email. Please do not reply.
                <br>
                &copy; ${new Date().getFullYear()} ${escapeHtml(BRAND_NAME)}
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

export const sendPasswordResetEmail = async (to, resetUrl, expiryMinutes) => {
  const safeResetUrl = escapeHtml(resetUrl);
  const safeExpiry = escapeHtml(expiryMinutes);

  const html = layout(
    "Reset your password",
    `
      <p style="margin:0 0 18px;">
        We received a request to reset your account password.
        Click the button below to choose a new password.
      </p>

      <p style="margin:24px 0;">
        <a href="${safeResetUrl}"
          style="display:inline-block;padding:11px 20px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:4px;">
          Reset Password
        </a>
      </p>

      <p style="margin:0 0 14px;font-size:13px;color:#4b5563;">
        This link expires in <strong>${safeExpiry} minutes</strong>
        and can only be used once.
      </p>

      <p style="margin:20px 0 6px;font-size:13px;">
        If the button does not work, copy this link into your browser:
      </p>

      <p style="margin:0;font-size:12px;line-height:1.7;overflow-wrap:anywhere;word-break:break-word;">
        <a href="${safeResetUrl}" style="color:#2563eb;">
          ${safeResetUrl}
        </a>
      </p>

      <p style="margin:22px 0 0;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    `
  );

  await sendMail({
    to,
    subject: `Reset your password | ${BRAND_NAME}`,
    html,
    text: `We received a request to reset your account password.

Use this link to choose a new password: ${resetUrl}

This link expires in ${expiryMinutes} minutes and can only be used once.

If you did not request a password reset, you can safely ignore this email.`,
  });
};

export const sendPasswordChangedEmail = async (to) => {
  const html = layout(
    "Your password was changed",
    `
      <p style="margin:0 0 16px;">
        Your account password has been changed successfully.
      </p>

      <p style="margin:0 0 16px;">
        You can now sign in using your updated password.
      </p>

      <p style="margin:0;">
        If you did not make this change, contact your administrator immediately.
      </p>
    `
  );

  await sendMail({
    to,
    subject: `Your password was changed | ${BRAND_NAME}`,
    html,
    text: "Your account password has been changed successfully. If you did not make this change, contact your administrator immediately.",
  });
};
