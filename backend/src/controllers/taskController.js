import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";
import { notifyTaskStakeholders } from "../helpers/taskNotificationHelper.js";
import { buildTaskScopeWhere } from "../utils/scope.js";

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

const getScopedTask = async (taskId, currentUser) => {
  const scopeWhere = await buildTaskScopeWhere(currentUser);

  return prisma.assignedTask.findFirst({
    where: {
      id: taskId,
      ...scopeWhere,
    },
    include: TASK_INCLUDE,
  });
};

export const listAssignedTasks = asyncHandler(async (req, res) => {
  const where = await buildTaskScopeWhere(req.user);

  const tasks = await prisma.assignedTask.findMany({
    where,
    include: TASK_INCLUDE,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(tasks);
});

export const createAssignedTask = asyncHandler(async (req, res) => {
  const {
    title,
    managerNotes,
    priority,
    dueDate,
    assigneeId,
  } = req.body;

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required.");
  }

  if (!assigneeId) {
    throw new ApiError(
      400,
      "Please pick who to assign this to."
    );
  }

  const assignee = await prisma.user.findUnique({
    where: {
      id: assigneeId,
    },
    select: {
      id: true,
      name: true,
      role: true,
      departmentId: true,
      managerId: true,
    },
  });

  if (!assignee) {
    throw new ApiError(404, "Assignee not found.");
  }

  if (
    req.user.role !== "superAdmin" &&
    assignee.departmentId !== req.user.departmentId
  ) {
    throw new ApiError(
      403,
      "You cannot assign a task to a user from another department."
    );
  }

  if (req.user.role === "manager") {
    const isSelf = assignee.id === req.user.id;

    const isDirectEmployee =
      assignee.managerId === req.user.id;

    if (!isSelf && !isDirectEmployee) {
      throw new ApiError(
        403,
        "You can only assign tasks to yourself or your direct employees."
      );
    }
  }

  const task = await prisma.assignedTask.create({
    data: {
      title: title.trim(),
      managerNotes: managerNotes?.trim() || null,
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
    "task",
    req.user.departmentId,
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

  if (!status) {
    throw new ApiError(400, "Status is required.");
  }

  const existing = await getScopedTask(
    req.params.id,
    req.user
  );

  if (!existing) {
    throw new ApiError(404, "Task not found.");
  }

  if (
    req.user.role === "employee" &&
    existing.assigneeId !== req.user.id
  ) {
    throw new ApiError(
      403,
      "You can only update tasks assigned to you."
    );
  }

  const task = await prisma.assignedTask.update({
    where: {
      id: req.params.id,
    },
    data: {
      status,
    },
    include: TASK_INCLUDE,
  });

  if (status !== existing.status) {
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

export const reassignTask = asyncHandler(async (req, res) => {
  const { assigneeId } = req.body;

  if (!assigneeId) {
    throw new ApiError(
      400,
      "Pick who to reassign this to."
    );
  }

  const existing = await getScopedTask(
    req.params.id,
    req.user
  );

  if (!existing) {
    throw new ApiError(404, "Task not found.");
  }

  const newAssignee = await prisma.user.findUnique({
    where: {
      id: assigneeId,
    },
    select: {
      id: true,
      name: true,
      role: true,
      departmentId: true,
      managerId: true,
    },
  });

  if (!newAssignee) {
    throw new ApiError(
      404,
      "New assignee not found."
    );
  }

  if (
    req.user.role !== "superAdmin" &&
    newAssignee.departmentId !== req.user.departmentId
  ) {
    throw new ApiError(
      403,
      "You cannot reassign a task to another department."
    );
  }

  if (req.user.role === "manager") {
    const isSelf = newAssignee.id === req.user.id;

    const isDirectEmployee =
      newAssignee.managerId === req.user.id;

    if (!isSelf && !isDirectEmployee) {
      throw new ApiError(
        403,
        "You can only reassign tasks to yourself or your direct employees."
      );
    }
  }

  const task = await prisma.assignedTask.update({
    where: {
      id: req.params.id,
    },
    data: {
      assigneeId,
    },
    include: TASK_INCLUDE,
  });

  await logActivity(
    req.user.id,
    `${req.user.name} reassigned "${task.title}" to ${task.assignee.name}`,
    "task",
    req.user.departmentId,
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

  if (!text?.trim()) {
    throw new ApiError(
      400,
      "Comment text is required."
    );
  }

  const existing = await getScopedTask(
    req.params.id,
    req.user
  );

  if (!existing) {
    throw new ApiError(404, "Task not found.");
  }

  await prisma.taskComment.create({
    data: {
      text: text.trim(),
      taskId: req.params.id,
      authorId: req.user.id,
    },
  });

  const task = await prisma.assignedTask.findUnique({
    where: {
      id: req.params.id,
    },
    include: TASK_INCLUDE,
  });

  const recipientId =
    req.user.id === task.assigneeId
      ? task.assignedById
      : task.assigneeId;

  if (
    recipientId &&
    recipientId !== req.user.id
  ) {
    await notifyTaskStakeholders({
      task,
      actor: req.user,
      type: "COMMENT",
      title: "New update on a task",
      message: `${req.user.name} commented on "${task.title}"`,
    });
  }

  res.status(201).json(task);
});

export const deleteAssignedTask = asyncHandler(async (req, res) => {
  const existing = await getScopedTask(
    req.params.id,
    req.user
  );

  if (!existing) {
    throw new ApiError(404, "Task not found.");
  }

  await prisma.assignedTask.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(204).send();
});
