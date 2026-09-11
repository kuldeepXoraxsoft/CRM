import prisma from "../config/db.js";

/**
 * Creates a notification for one user. Fire-and-forget by design (like
 * activityLogger.js) - a notification failing to write should never
 * break the actual request that triggered it.
 *
 * Usage from any controller:
 *   import { notify } from "../utils/notificationService.js";
 *   await notify({
 *     userId: task.assigneeId,
 *     type: "TASK_ASSIGNED",
 *     title: "New task assigned",
 *     message: `${req.user.name} assigned you "${task.title}"`,
 *     entityType: "task",
 *     entityId: task.id,
 *   });
 */
export async function notify({ userId, type, title, message, entityType, entityId }) {
  if (!userId) return null;

  try {
    return await prisma.notification.create({
      data: { userId, type, title, message, entityType, entityId },
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
    return null;
  }
}

/**
 * Same as notify(), but for a list of userIds at once (e.g. notifying
 * every member of a team). Uses createMany for a single DB round trip.
 */
export async function notifyMany({ userIds, type, title, message, entityType, entityId }) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueIds.length === 0) return;

  try {
    await prisma.notification.createMany({
      data: uniqueIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        entityType,
        entityId,
      })),
    });
  } catch (err) {
    console.error("Failed to create notifications:", err.message);
  }
}