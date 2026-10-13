
import ejs from "ejs";
import { fileURLToPath } from "node:url";
import { sendMail } from "./Mailer.js";

const BRAND_NAME = process.env.MAIL_BRAND_NAME;
const LOGO_URL = process.env.MAIL_LOGO_URL || "";

const renderTemplate = (filename, data = {}) => {
  const templatePath = fileURLToPath(
    new URL(`./templates/${filename}`, import.meta.url)
  );

  return ejs.renderFile(templatePath, {
    brandName: BRAND_NAME,
    logoUrl: LOGO_URL,
    year: new Date().getFullYear(),
    ...data,
  });
};

export const sendPasswordResetEmail = async (
  to,
  resetUrl,
  expiryMinutes
) => {
  const html = await renderTemplate("password-reset.ejs", {
    resetUrl,
    expiryMinutes,
  });

  await sendMail({
    to,
    subject: `Reset your password | ${BRAND_NAME}`,
    html,
    text: `We received a request to reset your account password.

Use this link to reset your password: ${resetUrl}

This link expires in ${expiryMinutes} minutes and can only be used once.

If you didn't request this, you can safely ignore this email.`,
  });
};

export const sendPasswordChangedEmail = async (to) => {
  const html = await renderTemplate("password-changed.ejs");

  await sendMail({
    to,
    subject: `Your password was changed | ${BRAND_NAME}`,
    html,
    text: `Your account password has been changed successfully.

If you didn't make this change, contact your administrator immediately to secure your account.`,
  });
};

export const sendWelcomeEmail = async ({ to, name, temporaryPassword }) => {
  const loginUrl = process.env.FRONTEND_URL;

  if (!loginUrl) {
    throw new Error("FRONTEND_URL is not configured.");
  }

  const html = await renderTemplate("welcome.ejs", {
    name: name || "there",
    email: to,
    loginUrl,
    temporaryPassword,
  });

  await sendMail({
    to,
    subject: `Welcome to ${BRAND_NAME} - Your account details`,
    html,
    text: `Welcome to ${BRAND_NAME}!

Hi ${name || "there"},

Your account has been created successfully.

Email: ${to}
Temporary password: ${temporaryPassword}

Sign in: ${loginUrl}

Please sign in and change your password immediately to keep your account secure.`,
  });
};
