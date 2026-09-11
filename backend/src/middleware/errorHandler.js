import ApiError from "../utils/ApiError.js";

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Prisma "record not found" style errors
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found." });
  }

  // Prisma unique constraint violation
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return res.status(409).json({ message: `That ${field} is already in use.` });
  }

  console.error(err);
  return res.status(500).json({ message: err.message });
}