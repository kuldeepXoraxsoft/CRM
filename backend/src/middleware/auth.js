import prisma from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Verifies the Bearer JWT on every protected request and attaches the
 * full current user (minus password) to req.user for downstream
 * controllers and the permission middleware to use.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Not authenticated. Please log in.");
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new ApiError(401, "Session expired or invalid. Please log in again.");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      departmentId: true,
      managerId: true,
      teamId: true,
    },
  });

  if (!user || user.status !== "Active") {
    throw new ApiError(401, "Account not found or inactive.");
  }

  req.user = user;
  next();
});