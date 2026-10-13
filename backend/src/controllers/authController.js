import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { signToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import crypto from "crypto";
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "../services/Emailservice/Mailservice.js";

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.status !== "Active") {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = signToken({
    id: user.id,
    role: user.role,
  });

  const { password: _password, ...safeUser } = user;

  res.json({
    token,
    user: safeUser,
  });
});

// Current logged-in user
export const me = asyncHandler(async (req, res) => {
  res.json({
    user: req.user,
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(
      400,
      "Current password and new password are required."
    );
  }

  if (newPassword.length < 8) {
    throw new ApiError(
      400,
      "New password must be at least 8 characters long."
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isCurrentPasswordValid) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  const isSamePassword = await bcrypt.compare(
    newPassword,
    user.password
  );

  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from the current password."
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  res.json({
    message: "Password updated successfully.",
  });
});

const EXPIRY_MINUTES = Number(process.env.RESET_TOKEN_EXPIRY_MINUTES || 30);
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Forgot password: email do, reset link bhejo
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!email) {
    throw new ApiError(400, "Email is required.");
  }

  const genericResponse = {
    message: "If that email exists, we've sent a password reset link.",
  };

  const user = await prisma.user.findUnique({ where: { email } });

  // Email exist na kare ya user inactive ho, tab bhi same response (enumeration se bachne ke liye)
  if (!user || user.status !== "Active") {
    return res.json(genericResponse);
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.$transaction([
    prisma.passwordReset.deleteMany({ where: { userId: user.id } }), // purane tokens invalid
    prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000),
      },
    }),
  ]);

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // await nahi kar rahe taaki response time se pata na chale email exist karta hai ya nahi
  sendPasswordResetEmail(user.email, resetUrl, EXPIRY_MINUTES).catch((err) =>
    console.error("Reset email failed:", err.message)
  );

  res.json(genericResponse);
});

// Reset password: token + naya password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required.");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long.");
  }

  const record = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashToken(String(token)) },
    include: { user: true },
  });

  if (
    !record ||
    record.usedAt ||
    record.expiresAt < new Date() ||
    record.user.status !== "Active"
  ) {
    throw new ApiError(400, "Invalid or expired reset link.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction(async (tx) => {
    // Atomic claim: do requests ek hi token use na kar sakein
    const claimed = await tx.passwordReset.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    if (claimed.count === 0) {
      throw new ApiError(400, "Invalid or expired reset link.");
    }

    await tx.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    });

    // Is user ke baaki saare reset tokens bhi hata do
    await tx.passwordReset.deleteMany({
      where: { userId: record.userId, id: { not: record.id } },
    });

    // Saare refresh tokens revoke karo taaki purani sessions logout ho jayein
    await tx.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });

  sendPasswordChangedEmail(record.user.email).catch((err) =>
    console.error("Confirmation email failed:", err.message)
  );

  res.json({ message: "Password reset successfully. You can now log in." });
});