import nodemailer from "nodemailer";

import prisma from "../../config/db.js";
import { decryptSecret } from "../../utils/secretBox.js";

// ------------------------------------------------------------------
// Each department sends mail with its OWN SMTP account, stored in the
// DepartmentEmailConfig table (password encrypted). If a department has
// no config yet we fall back to the SMTP_* values in .env (if present),
// so existing flows keep working until the department is configured.
// ------------------------------------------------------------------

export const formatFrom = (name, email) => {
  const cleanName = String(name || "").replace(/["\r\n]/g, "").trim();
  return cleanName ? `"${cleanName}" <${email}>` : email;
};

const envConfig = () => {
  if (!process.env.SMTP_HOST) return null;

  const user = process.env.SMTP_USER;

  return {
    source: "env",
    cacheKey: "env",
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true", // true only for port 465
    user,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || user,
  };
};

export async function resolveMailConfig(departmentId) {
  if (departmentId) {
    const row = await prisma.departmentEmailConfig.findUnique({
      where: { departmentId },
    });

    if (row) {
      return {
        source: "department",
        // updatedAt in the key => editing the config rebuilds the transporter
        cacheKey: `dept:${departmentId}:${row.updatedAt.getTime()}`,
        host: row.smtpHost,
        port: row.smtpPort,
        secure: row.smtpSecure,
        // true => don't verify the server's TLS certificate (less secure)
        allowInvalidCert: row.allowInvalidCert,
        user: row.smtpUser,
        pass: decryptSecret(row.smtpPasswordEnc),
        from: formatFrom(row.fromName, row.fromEmail || row.smtpUser),
      };
    }
  }

  const fallback = envConfig();

  if (!fallback) {
    throw new Error(
      "Email is not configured for this department. Ask an admin to set it up in Settings > Organization."
    );
  }

  return fallback;
}

const buildTransporter = (cfg) =>
  nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    ...(cfg.allowInvalidCert ? { tls: { rejectUnauthorized: false } } : {}),
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

const transporterCache = new Map();

function getTransporter(cfg) {
  const cached = transporterCache.get(cfg.cacheKey);
  if (cached) return cached;

  // Drop older versions of the same department's transporter
  if (cfg.source === "department") {
    const prefix = cfg.cacheKey.split(":").slice(0, 2).join(":");
    for (const key of transporterCache.keys()) {
      if (key.startsWith(`${prefix}:`)) {
        transporterCache.get(key).close();
        transporterCache.delete(key);
      }
    }
  }

  const transporter = buildTransporter(cfg);
  transporterCache.set(cfg.cacheKey, transporter);
  return transporter;
}

// Kept for compatibility: checks the .env fallback account on startup.
export const verifyMailer = async () => {
  const cfg = envConfig();
  if (!cfg) return;

  try {
    await getTransporter(cfg).verify();
    console.log("Mail server ready");
  } catch (err) {
    console.error("Mail server error:", err.message);
  }
};

/**
 * Send with the given department's SMTP account.
 * departmentId can be null (e.g. superAdmin) -> .env fallback.
 */
export const sendMail = async ({
  departmentId,
  to,
  subject,
  html,
  text,
  attachments,
}) => {
  const cfg = await resolveMailConfig(departmentId);

  return getTransporter(cfg).sendMail({
    from: cfg.from,
    to,
    subject,
    html,
    text,
    attachments,
  });
};

/**
 * Send with an explicit (possibly unsaved) config - used by "Send test email".
 * Uses a throw-away transporter.
 */
export const sendMailWithConfig = async (
  cfg,
  { to, subject, html, text, attachments }
) => {
  const transporter = buildTransporter(cfg);

  try {
    return await transporter.sendMail({
      from: cfg.from,
      to,
      subject,
      html,
      text,
      attachments,
    });
  } finally {
    transporter.close();
  }
};
