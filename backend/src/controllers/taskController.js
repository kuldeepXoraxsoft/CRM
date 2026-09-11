import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";
import { notifyTaskStakeholders } from "../helpers/taskNotificationHelper.js";
const TASK_INCLUDE = {
  assignee: {
    select: {
      id: true,
      name: true,
      departmentId: true,
    },
  },

  assignedBy: {
    select: {
      id: true,
      name: true,
      departmentId: true,
    },
  },

  comments: {
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
};

export const listAssignedTasks = asyncHandler(async (req, res) => {
  const { role, id } = req.user;

  let where = { assigneeId: id };

  if (role === "admin") {
    where = {};
  } else if (role === "manager") {
    const employees = await prisma.user.findMany({
      where: { managerId: id },
      select: { id: true },
    });
    where = { assigneeId: { in: [id, ...employees.map((e) => e.id)] } };
  }

  const tasks = await prisma.assignedTask.findMany({
    where,
    include: TASK_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  res.json(tasks);
});

// Gated by authorize("ASSIGN_TASK") in the route - manager/admin only.
export const createAssignedTask = asyncHandler(async (req, res) => {
  const { title, managerNotes, priority, dueDate, assigneeId } = req.body;

  if (!title?.trim()) throw new ApiError(400, "Title is required.");
  if (!assigneeId) throw new ApiError(400, "Please pick who to assign this to.");

  const task = await prisma.assignedTask.create({
    data: {
      title,
      managerNotes,
      priority: priority || "Medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId,
      assignedById: req.user.id,
    },
    include: TASK_INCLUDE,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} assigned "${task.title}" to ${task.assignee.name}`,
    "task"
  );

  await notifyTaskStakeholders({
    task,
    actor: req.user,
    type: "TASK_ASSIGNED",
    title: "New task assigned",
    message: `${req.user.name} assigned you "${task.title}"`,
  });

  res.status(201).json(task);
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const existing = await prisma.assignedTask.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Task not found.");

  if (req.user.role === "employee" && existing.assigneeId !== req.user.id) {
    throw new ApiError(403, "You can only update tasks assigned to you.");
  }

  const task = await prisma.assignedTask.update({
    where: { id: req.params.id },
    data: { status: status ?? existing.status },
    include: TASK_INCLUDE,
  });

  // Let the manager who assigned it know it moved - and use a distinct
  // notification type when it's specifically marked Completed.
  if (
    status &&
    status !== existing.status
  ) {
    await notifyTaskStakeholders({
      task,
      actor: req.user,
      type:
        status === "Completed"
          ? "TASK_COMPLETED"
          : "TASK_UPDATED",
      title:
        status === "Completed"
          ? "Task completed"
          : "Task status updated",
      message:
        status === "Completed"
          ? `${req.user.name} marked "${task.title}" as completed`
          : `${req.user.name} updated "${task.title}" to ${status}`,
    });
  }

  res.json(task);
});

// Gated by authorize("REASSIGN_TASK") in the route - manager/admin only.
export const reassignTask = asyncHandler(async (req, res) => {
  const { assigneeId } = req.body;
  if (!assigneeId) throw new ApiError(400, "Pick who to reassign this to.");

  const existing = await prisma.assignedTask.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Task not found.");

  const task = await prisma.assignedTask.update({
    where: { id: req.params.id },
    data: { assigneeId },
    include: TASK_INCLUDE,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} reassigned "${task.title}" to ${task.assignee.name}`,
    "task"
  );

  await notifyTaskStakeholders({
    task,
    actor: req.user,
    type: "TASK_ASSIGNED",
    title: "Task reassigned",
    message: `${req.user.name} reassigned "${task.title}" to ${task.assignee.name}`,
  });

  res.json(task);
});

export const addTaskComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) throw new ApiError(400, "Comment text is required.");

  const existing = await prisma.assignedTask.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Task not found.");

  await prisma.taskComment.create({
    data: { text: text.trim(), taskId: req.params.id, authorId: req.user.id },
  });

  const task = await prisma.assignedTask.findUnique({
    where: { id: req.params.id },
    include: TASK_INCLUDE,
  });

  // Notify whichever side of the assignment DIDN'T write the comment.
  const recipientId =
    req.user.id === task.assigneeId ? task.assignedById : task.assigneeId;

  if (recipientId && recipientId !== req.user.id) {
    await notify({
      userId: recipientId,
      type: "COMMENT",
      title: "New update on a task",
      message: `${req.user.name} commented on "${task.title}"`,
      entityType: "task",
      entityId: task.id,
    });
  }

  res.status(201).json(task);
});

// Gated by authorize("ASSIGN_TASK") in the route - manager/admin only.
export const deleteAssignedTask = asyncHandler(async (req, res) => {
  const existing = await prisma.assignedTask.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Task not found.");

  await prisma.assignedTask.delete({ where: { id: req.params.id } });
  res.status(204).send();
});