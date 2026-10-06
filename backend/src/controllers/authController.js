import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { signToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

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