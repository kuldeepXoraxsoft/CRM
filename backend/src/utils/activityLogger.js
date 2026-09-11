import prisma from "../config/db.js";

/**
 * Fire-and-forget activity log entry - used by controllers after a
 * notable action (lead converted, employee added, task reassigned...).
 * Never throws - a logging failure should never break the actual request.
 */
export async function logActivity(actorId, message, type = "general") {
  try {
    await prisma.activity.create({ data: { actorId, message, type } });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
}