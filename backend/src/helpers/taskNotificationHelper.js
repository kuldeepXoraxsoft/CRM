import prisma from "../config/db.js";
import { notifyMany } from "../services/notificationService.js";

export async function notifyTaskStakeholders({
  task,
  actor,
  type,
  title,
  message,
}) {
  const recipientIds = new Set();

  // Assignee
  if (task.assigneeId) {
    recipientIds.add(task.assigneeId);
  }

  // Person who assigned the task
  if (task.assignedById) {
    recipientIds.add(task.assignedById);
  }

  // Get assignee department
  let departmentId = null;

  if (task.assignee?.departmentId) {
    departmentId = task.assignee.departmentId;
  } else if (task.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: task.assigneeId },
      select: {
        departmentId: true,
      },
    });

    departmentId = assignee?.departmentId;
  }

  // Department managers + admins
  if (departmentId) {
    const departmentUsers = await prisma.user.findMany({
      where: {
        departmentId,
        status: "Active",
        role: {
          in: ["manager", "admin"],
        },
      },
      select: {
        id: true,
      },
    });

    departmentUsers.forEach((user) => {
      recipientIds.add(user.id);
    });
  }

  // Don't notify actor
  if (actor?.id) {
    recipientIds.delete(actor.id);
  }

  await notifyMany({
    userIds: [...recipientIds],
    type,
    title,
    message,
    entityType: "task",
    entityId: task.id,
  });
}