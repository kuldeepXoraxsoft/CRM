import ejs from "ejs";
import { fileURLToPath } from "node:url";

import { sendMail, sendMailWithConfig } from "./Mailer.js";
import { getBranding, getLogoRecord } from "../organizationService.js";

const LOGO_CID = "company-logo";
const LOGO_EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Company name + logo come from the database (Settings > Organization).
// .env values are only a fallback for installs that haven't set them yet.
//
// The logo is embedded in the email as an inline (CID) attachment so it
// shows without needing a public URL. Gmail/Outlook don't render SVG, so
// an SVG logo falls back to MAIL_LOGO_URL (use a PNG there).
async function getEmailBranding() {
  const branding = await getBranding();

  const brandName =
    branding.companyName || process.env.MAIL_BRAND_NAME || "CRM";

  let logoUrl = process.env.MAIL_LOGO_URL || "";
  let attachments = [];

  if (branding.hasLogo) {
    const logo = await getLogoRecord();
    const ext = LOGO_EXT[logo?.logoMime];

    if (logo?.logoData && ext) {
      logoUrl = `cid:${LOGO_CID}`;
      attachments = [
        {
          filename: `logo.${ext}`,
          content: Buffer.from(logo.logoData),
          contentType: logo.logoMime,
          cid: LOGO_CID,
        },
      ];
    }
  }

  return { brandName, logoUrl, attachments };
}

const renderTemplate = (filename, data) => {
  const templatePath = fileURLToPath(
    new URL(`./templates/${filename}`, import.meta.url)
  );

  return ejs.renderFile(templatePath, data);
};

async function deliver({
  departmentId,
  to,
  template,
  data = {},
  subject,
  text,
}) {
  const { brandName, logoUrl, attachments } = await getEmailBranding();

  const html = await renderTemplate(template, {
    brandName,
    logoUrl,
    year: new Date().getFullYear(),
    ...data,
  });

  await sendMail({
    departmentId,
    to,
    subject: subject(brandName),
    html,
    text: text(brandName),
    attachments,
  });
}

// departmentId = the RECIPIENT's department, so the mail goes out from
// that department's own email account.

export const sendPasswordResetEmail = async (
  to,
  resetUrl,
  expiryMinutes,
  departmentId = null
) =>
  deliver({
    departmentId,
    to,
    template: "password-reset.ejs",
    data: { resetUrl, expiryMinutes },
    subject: (brand) => `Reset your password | ${brand}`,
    text: () => `We received a request to reset your account password.

Use this link to reset your password: ${resetUrl}

This link expires in ${expiryMinutes} minutes and can only be used once.

If you didn't request this, you can safely ignore this email.`,
  });

export const sendPasswordChangedEmail = async (to, departmentId = null) =>
  deliver({
    departmentId,
    to,
    template: "password-changed.ejs",
    subject: (brand) => `Your password was changed | ${brand}`,
    text: () => `Your account password has been changed successfully.

If you didn't make this change, contact your administrator immediately to secure your account.`,
  });

export const sendWelcomeEmail = async ({
  to,
  name,
  temporaryPassword,
  departmentId = null,
}) => {
  const loginUrl = process.env.FRONTEND_URL;

  if (!loginUrl) {
    throw new Error("FRONTEND_URL is not configured.");
  }

  return deliver({
    departmentId,
    to,
    template: "welcome.ejs",
    data: {
      name: name || "there",
      email: to,
      loginUrl,
      temporaryPassword,
    },
    subject: (brand) => `Welcome to ${brand} - Your account details`,
    text: (brand) => `Welcome to ${brand}!

Hi ${name || "there"},

Your account has been created successfully.

Email: ${to}
Temporary password: ${temporaryPassword}

Sign in: ${loginUrl}

Please sign in and change your password immediately to keep your account secure.`,
  });
};

// "Send test email" button: uses the config from the form (saved or not).
export const sendTestEmail = async ({ config, to }) => {
  const { brandName, logoUrl, attachments } = await getEmailBranding();

  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="${brandName}" style="max-height:48px;margin-bottom:16px" /><br />`
    : "";

  await sendMailWithConfig(config, {
    to,
    subject: `Test email | ${brandName}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">${logo}<p>This is a test email from <strong>${brandName}</strong>.</p><p>Your email settings are working.</p></div>`,
    text: `This is a test email from ${brandName}. Your email settings are working.`,
    attachments,
  });
};
