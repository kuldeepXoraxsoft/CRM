import crypto from "node:crypto";

let warned = false;

function getKey() {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY (or JWT_SECRET) must be set to store email passwords."
    );
  }

  if (!process.env.SETTINGS_ENCRYPTION_KEY && !warned) {
    warned = true;
    console.warn(
      "SETTINGS_ENCRYPTION_KEY is not set - using JWT_SECRET to encrypt email passwords."
    );
  }

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(plainText), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return ["v1", iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptSecret(payload) {
  const [version, iv, tag, data] = String(payload || "").split(":");

  if (version !== "v1" || !iv || !tag || !data) {
    throw new Error("Stored email password is corrupted. Please save it again.");
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(tag, "base64"));

    return Buffer.concat([
      decipher.update(Buffer.from(data, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error(
      "Could not decrypt the stored email password (encryption key changed?). Please save the password again."
    );
  }
}
