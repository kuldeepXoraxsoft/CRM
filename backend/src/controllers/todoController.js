import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Todos are always personal - scoped to req.user.id, no cross-user access.

export const listMyTodos = asyncHandler(async (req, res) => {
  const todos = await prisma.todo.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(todos);
});

export const createTodo = asyncHandler(async (req, res) => {
  const { title, dueDate, priority, status, notes } = req.body;

  if (!title?.trim()) throw new ApiError(400, "Title is required.");

  const todo = await prisma.todo.create({
    data: {
      title,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "Medium",
      status: status || "Pending",
      notes,
      userId: req.user.id,
    },
  });

  res.status(201).json(todo);
});

export const updateTodo = asyncHandler(async (req, res) => {
  const existing = await prisma.todo.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Todo not found.");
  if (existing.userId !== req.user.id) {
    throw new ApiError(403, "You can only edit your own todos.");
  }

  const { title, dueDate, priority, status, notes } = req.body;

  const todo = await prisma.todo.update({
    where: { id: req.params.id },
    data: {
      title: title ?? existing.title,
      dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
      priority: priority ?? existing.priority,
      status: status ?? existing.status,
      notes: notes ?? existing.notes,
    },
  });

  res.json(todo);
});

export const toggleTodoComplete = asyncHandler(async (req, res) => {
  const existing = await prisma.todo.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Todo not found.");
  if (existing.userId !== req.user.id) {
    throw new ApiError(403, "You can only update your own todos.");
  }

  const todo = await prisma.todo.update({
    where: { id: req.params.id },
    data: { status: existing.status === "Completed" ? "Pending" : "Completed" },
  });

  res.json(todo);
});

export const deleteTodo = asyncHandler(async (req, res) => {
  const existing = await prisma.todo.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Todo not found.");
  if (existing.userId !== req.user.id) {
    throw new ApiError(403, "You can only delete your own todos.");
  }

  await prisma.todo.delete({ where: { id: req.params.id } });
  res.status(204).send();
});