import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { encryptSecret, decryptSecret } from "../utils/secretBox.js";
import { formatFrom } from "../services/Emailservice/Mailer.js";
import { sendTestEmail as sendTestEmailMessage } from "../services/Emailservice/Mailservice.js";
import {
  ORG_ID,
  getBranding,
  getLogoRecord,
} from "../services/organizationService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_LINE_BREAK = /[\r\n]/;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

// ==========================================
// LOGO HELPERS
// ==========================================

function detectImageMime(buf) {
  if (buf.length >= 8 && buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) {
    return "image/png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (buf.subarray(0, 1024).toString("utf8").includes("<svg")) {
    return "image/svg+xml";
  }
  return null;
}

function parseLogoDataUrl(dataUrl) {
  const match = /^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,([A-Za-z0-9+/=\s]+)$/.exec(
    String(dataUrl)
  );

  if (!match) {
    throw new ApiError(400, "Logo must be a PNG, JPG, WEBP or SVG image.");
  }

  const buffer = Buffer.from(match[2], "base64");

  if (buffer.length === 0 || buffer.length > MAX_LOGO_BYTES) {
    throw new ApiError(400, "Logo must be smaller than 2 MB.");
  }

  // Don't trust the declared type - check the real file signature.
  if (detectImageMime(buffer) !== match[1]) {
    throw new ApiError(400, "The uploaded file is not a valid image.");
  }

  return { buffer, mime: match[1] };
}

// ==========================================
// COMPANY (name + logo)
// ==========================================

// GET /api/organization  (public - login page needs the branding too)
export const getOrganization = asyncHandler(async (req, res) => {
  res.json(await getBranding());
});

// GET /api/organization/logo  (public image)
export const getLogo = asyncHandler(async (req, res) => {
  const org = await getLogoRecord();

  if (!org?.logoData || !org.logoMime) {
    throw new ApiError(404, "No logo uploaded.");
  }

  res.set({
    "Content-Type": org.logoMime,
    // URL carries ?v=<version>, so a changed logo always has a new URL
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    // If an SVG is ever opened directly, don't let it run scripts
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  });

  res.send(Buffer.from(org.logoData));
});

// PUT /api/organization  (superAdmin)
// body: { companyName?, logo?: "data:image/...;base64,...", removeLogo?: boolean }
export const updateOrganization = asyncHandler(async (req, res) => {
  const { companyName, logo, removeLogo } = req.body || {};
  const data = {};

  if (companyName !== undefined) {
    const name = String(companyName).trim();

    if (!name) throw new ApiError(400, "Company name is required.");
    if (name.length > 100) {
      throw new ApiError(400, "Company name must be 100 characters or fewer.");
    }

    data.companyName = name;
  }

  if (removeLogo) {
    data.logoData = null;
    data.logoMime = null;
    data.logoUpdatedAt = null;
  } else if (logo) {
    const { buffer, mime } = parseLogoDataUrl(logo);
    data.logoData = buffer;
    data.logoMime = mime;
    data.logoUpdatedAt = new Date();
  }

  await prisma.organization.upsert({
    where: { id: ORG_ID },
    create: { id: ORG_ID, companyName: "", ...data },
    update: data,
  });

  res.json({
    message: "Organization updated successfully.",
    ...(await getBranding()),
  });
});

// ==========================================
// DEPARTMENT EMAIL (SMTP) CONFIG
// ==========================================

// superAdmin picks any department (?departmentId=...);
// admin is locked to their own department.
async function resolveDepartment(req) {
  const requested = req.query.departmentId || req.body?.departmentId;
  let departmentId;

  if (req.user.role === "superAdmin") {
    if (!requested) throw new ApiError(400, "Please select a department.");
    departmentId = requested;
  } else {
    if (!req.user.departmentId) {
      throw new ApiError(403, "You are not assigned to a department.");
    }
    if (requested && requested !== req.user.departmentId) {
      throw new ApiError(403, "You can only manage your own department.");
    }
    departmentId = req.user.departmentId;
  }

  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true, name: true },
  });

  if (!department) throw new ApiError(404, "Department not found.");

  return department;
}

// Never returns the password - only whether one is saved.
function serializeConfig(row, department) {
  return {
    departmentId: department.id,
    departmentName: department.name,
    configured: Boolean(row),
    smtpHost: row?.smtpHost || "",
    smtpPort: row ? String(row.smtpPort) : "587",
    smtpSecure: row?.smtpSecure ?? false,
    allowInvalidCert: row?.allowInvalidCert ?? false,
    smtpUser: row?.smtpUser || "",
    smtpPasswordSet: Boolean(row),
    smtpFromName: row?.fromName || "",
    smtpFromEmail: row?.fromEmail || "",
    updatedAt: row?.updatedAt || null,
    // true => this department isn't configured but the server .env account will be used
    usingFallback: !row && Boolean(process.env.SMTP_HOST),
  };
}

function readConfigInput(body = {}) {
  const smtpHost = String(body.smtpHost || "").trim();
  const smtpUser = String(body.smtpUser || "").trim();
  const fromName = String(body.smtpFromName || "").trim();
  const fromEmail = String(body.smtpFromEmail || "").trim();
  const port = Number(body.smtpPort);

  if (!smtpHost) throw new ApiError(400, "SMTP host is required.");
  if (smtpHost.length > 255 || /\s/.test(smtpHost)) {
    throw new ApiError(400, "SMTP host is not valid.");
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ApiError(400, "Enter a valid SMTP port (1 - 65535).");
  }

  if (!smtpUser) throw new ApiError(400, "SMTP user is required.");

  if (fromEmail && !EMAIL_REGEX.test(fromEmail)) {
    throw new ApiError(400, "From email is not a valid email address.");
  }

  if (fromName.length > 100) {
    throw new ApiError(400, "From name must be 100 characters or fewer.");
  }

  // Blocks header injection
  for (const value of [smtpHost, smtpUser, fromName, fromEmail]) {
    if (HAS_LINE_BREAK.test(value)) {
      throw new ApiError(400, "Fields cannot contain line breaks.");
    }
  }

  const password =
    typeof body.smtpPassword === "string" && body.smtpPassword !== ""
      ? body.smtpPassword
      : null;

  return {
    smtpHost,
    smtpPort: port,
    smtpSecure: Boolean(body.smtpSecure),
    allowInvalidCert: Boolean(body.allowInvalidCert),
    smtpUser,
    fromName: fromName || null,
    fromEmail: fromEmail || null,
    password, // null => keep the saved one
  };
}

// GET /api/organization/email-config?departmentId=
export const getEmailConfig = asyncHandler(async (req, res) => {
  const department = await resolveDepartment(req);

  const row = await prisma.departmentEmailConfig.findUnique({
    where: { departmentId: department.id },
  });

  res.json(serializeConfig(row, department));
});

// PUT /api/organization/email-config
export const saveEmailConfig = asyncHandler(async (req, res) => {
  const department = await resolveDepartment(req);
  const input = readConfigInput(req.body);

  const existing = await prisma.departmentEmailConfig.findUnique({
    where: { departmentId: department.id },
    select: { id: true },
  });

  if (!existing && !input.password) {
    throw new ApiError(400, "SMTP password is required.");
  }

  const fields = {
    smtpHost: input.smtpHost,
    smtpPort: input.smtpPort,
    smtpSecure: input.smtpSecure,
    allowInvalidCert: input.allowInvalidCert,
    smtpUser: input.smtpUser,
    fromName: input.fromName,
    fromEmail: input.fromEmail,
  };

  const row = await prisma.departmentEmailConfig.upsert({
    where: { departmentId: department.id },
    create: {
      departmentId: department.id,
      ...fields,
      smtpPasswordEnc: encryptSecret(input.password),
    },
    update: {
      ...fields,
      ...(input.password ? { smtpPasswordEnc: encryptSecret(input.password) } : {}),
    },
  });

  res.json({
    message: "Email settings saved.",
    ...serializeConfig(row, department),
  });
});

// DELETE /api/organization/email-config?departmentId=
export const deleteEmailConfig = asyncHandler(async (req, res) => {
  const department = await resolveDepartment(req);

  await prisma.departmentEmailConfig.deleteMany({
    where: { departmentId: department.id },
  });

  res.json({
    message: "Email settings removed.",
    ...serializeConfig(null, department),
  });
});

function friendlySmtpError(err, host, port) {
  // Always log the real error on the server for debugging
  console.error("SMTP test failed:", err?.code, err?.command, err?.message);

  const reason = [err?.code, err?.message].filter(Boolean).join(": ");
  const detail = reason ? ` (${reason})` : "";
  const text = `${err?.code || ""} ${err?.message || ""}`;

  if (err?.code === "EAUTH") {
    return `Authentication failed${detail}. Check the SMTP username and password (Gmail needs an App Password).`;
  }

  // TLS / certificate problems (nodemailer reports these as ESOCKET)
  if (/altnames|certificate|self[- ]signed|unable to verify|CERT_/i.test(text)) {
    return `The server's TLS certificate does not match "${host}"${detail}. Use the hostname on the certificate (for GoDaddy: smtpout.secureserver.net), or turn on \"Skip certificate check\" (less secure).`;
  }

  // Port / SSL setting mismatch
  if (/wrong version number|ssl3_get_record|packet length too long/i.test(text)) {
    return `SSL setting does not match port ${port}${detail}. Port 465 needs "Use secure connection" ON; port 587 needs it OFF.`;
  }

  if (err?.code === "ENOTFOUND" || err?.code === "EDNS") {
    return `Host "${host}" was not found${detail}. Check the SMTP host for typos.`;
  }

  if (err?.code === "ECONNREFUSED") {
    return `Connection to ${host}:${port} was refused${detail}. This port may be closed on the mail server - try 465 (SSL on) or ask your provider.`;
  }

  if (err?.code === "ETIMEDOUT" || err?.code === "ECONNECTION" || err?.code === "ESOCKET") {
    return `Could not connect to ${host}:${port}${detail}. The port may be blocked by a firewall/ISP, or the host/port/SSL setting is wrong.`;
  }

  return `Could not send the test email${detail || ": unknown error"}`;
}

// POST /api/organization/email-config/test
// Uses the values currently in the form; if the password field is blank,
// the saved password is used. The test mail goes to the logged-in user.
export const sendTestEmail = asyncHandler(async (req, res) => {
  const department = await resolveDepartment(req);
  const input = readConfigInput(req.body);

  let password = input.password;

  if (!password) {
    const saved = await prisma.departmentEmailConfig.findUnique({
      where: { departmentId: department.id },
      select: { smtpPasswordEnc: true },
    });

    if (!saved) throw new ApiError(400, "SMTP password is required.");

    try {
      password = decryptSecret(saved.smtpPasswordEnc);
    } catch (err) {
      throw new ApiError(400, err.message);
    }
  }

  const config = {
    host: input.smtpHost,
    port: input.smtpPort,
    secure: input.smtpSecure,
    allowInvalidCert: input.allowInvalidCert,
    user: input.smtpUser,
    pass: password,
    from: formatFrom(input.fromName, input.fromEmail || input.smtpUser),
  };

  try {
    await sendTestEmailMessage({ config, to: req.user.email });
  } catch (err) {
    throw new ApiError(400, friendlySmtpError(err, config.host, config.port));
  }

  res.json({ message: `Test email sent to ${req.user.email}.` });
});
