import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";
import { notifyMany } from "../services/notificationService.js";
import { getPagination } from "../utils/pagination.js";

const USER = { id: true, name: true, email: true, role: true, departmentId: true, managerId: true };
const INCLUDE = {
  createdBy: { select: USER }, assignee: { select: USER },
  department: { select: { id: true, name: true } },
  account: { select: { id: true, customerName: true } },
  lead: { select: { id: true, customerName: true } },
  comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
  history: { include: { changedBy: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } },
};

async function scope(req) {
  if (req.user.role === "superAdmin") return {};
  if (!req.user.departmentId) return { departmentId: "__NO_DEPARTMENT__" };
  if (req.user.role === "admin") return { departmentId: req.user.departmentId };
  if (req.user.role === "manager") {
    const employees = await prisma.user.findMany({ where: { managerId: req.user.id }, select: { id: true } });
    const ids = [req.user.id, ...employees.map(x => x.id)];
    return { departmentId: req.user.departmentId, OR: [{ createdById: { in: ids } }, { assigneeId: { in: ids } }] };
  }
  return { departmentId: req.user.departmentId, OR: [{ createdById: req.user.id }, { assigneeId: req.user.id }] };
}

export const listTickets = asyncHandler(async (req, res) => {
  const scopeWhere = await scope(req);
  const { page, limit, skip } = getPagination(req);
  const search = req.query.search?.trim();
  const where = search
    ? {
        AND: [
          scopeWhere,
          {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
              { assignee: { name: { contains: search, mode: "insensitive" } } },
              { createdBy: { name: { contains: search, mode: "insensitive" } } },
            ],
          },
        ],
      }
    : scopeWhere;

  const [tickets, total] = await prisma.$transaction([
    prisma.ticket.findMany({ where, include: INCLUDE, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.ticket.count({ where }),
  ]);
  const totalPages = Math.ceil(total / limit);
  res.json({ data: tickets, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } });
});

export const getTicket = asyncHandler(async (req, res) => {
  const where = await scope(req);
  const ticket = await prisma.ticket.findFirst({ where: { id: req.params.id, ...where }, include: INCLUDE });
  if (!ticket) throw new ApiError(404, "Ticket not found.");
  res.json(ticket);
});

async function validateAssignee(req, assigneeId) {
  if (!assigneeId) return null;
  const assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: USER });
  if (!assignee || assignee.status !== "Active") throw new ApiError(404, "Assignee not found.");
  if (req.user.role !== "superAdmin" && assignee.departmentId !== req.user.departmentId) throw new ApiError(403, "Assignee must belong to your department.");
  if (req.user.role === "manager" && assignee.id !== req.user.id && assignee.managerId !== req.user.id) throw new ApiError(403, "You can assign tickets only to yourself or your direct employees.");
  return assignee;
}

export const createTicket = asyncHandler(async (req, res) => {
  const { title, description, priority = "Medium", status = "Open", category = "General", accountId, leadId } = req.body;
  if (!title?.trim()) throw new ApiError(400, "Title is required.");
  if (!req.user.departmentId && req.user.role !== "superAdmin") throw new ApiError(400, "User has no department.");
  const ticket = await prisma.ticket.create({
    data: { title: title.trim(), description: description?.trim() || null, priority, category,
      accountId: accountId || null, leadId: leadId || null,
      departmentId: req.user.departmentId || assignee?.departmentId,
      createdById: req.user.id,
      status,
      history: { create: { toStatus: status, changedById: req.user.id } } },
    include: INCLUDE,
  });
  await logActivity(req.user.id, `${req.user.name} created ticket #${ticket.ticketNumber}: ${ticket.title}`, "ticket", req.user.departmentId);
  res.status(201).json(ticket);
});

export const updateTicket = asyncHandler(async (req, res) => {
  const existing = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Ticket not found.");
  const scoped = await prisma.ticket.findFirst({ where: { id: existing.id, ...(await scope(req)) } });
  if (!scoped) throw new ApiError(404, "Ticket not found.");

  const canEdit = req.user.role === "superAdmin" || req.user.role === "admin" || existing.createdById === req.user.id || existing.assigneeId === req.user.id;
  if (!canEdit) throw new ApiError(403, "You cannot edit this ticket.");

  const { title, description, priority, status } = req.body;
  const data = {
    title: title === undefined ? undefined : title.trim(),
    description: description === undefined ? undefined : (description?.trim() || null),
    priority: priority || undefined,
    status: status || undefined,
    resolvedAt: status === "Resolved" || status === "Closed" ? new Date() : status ? null : undefined,
  };

  const ticket = await prisma.$transaction(async tx => {
    const updated = await tx.ticket.update({ where: { id: existing.id }, data, include: INCLUDE });
    if (status && status !== existing.status) {
      await tx.ticketStatusHistory.create({
        data: { ticketId: existing.id, fromStatus: existing.status, toStatus: status, changedById: req.user.id },
      });
    }
    return updated;
  });

  const recipients = [...new Set([ticket.assigneeId, ticket.createdById].filter(id => id && id !== req.user.id))];
  if (recipients.length) await notifyMany({ userIds: recipients, type: "TICKET_UPDATED", title: "Ticket updated", message: `${req.user.name} updated "${ticket.title}"`, entityType: "ticket", entityId: ticket.id });
  res.json(ticket);
});

export const assignTicket = asyncHandler(async (req, res) => {
  if (!["manager", "admin", "superAdmin"].includes(req.user.role)) {
    throw new ApiError(403, "Only managers and admins can assign tickets.");
  }

  const existing = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Ticket not found.");

  const scoped = await prisma.ticket.findFirst({ where: { id: existing.id, ...(await scope(req)) } });
  if (!scoped) throw new ApiError(404, "Ticket not found.");

  const assignee = await validateAssignee(req, req.body.assigneeId);
  if (!assignee) throw new ApiError(400, "A valid assignee is required.");

  const ticket = await prisma.ticket.update({
    where: { id: existing.id },
    data: { assigneeId: assignee.id },
    include: INCLUDE,
  });

  if (assignee.id !== req.user.id) {
    await notifyMany({
      userIds: [assignee.id],
      type: "TICKET_ASSIGNED",
      title: "Ticket assigned",
      message: `${req.user.name} assigned you ticket #${ticket.ticketNumber}: ${ticket.title}`,
      entityType: "ticket",
      entityId: ticket.id,
    });
  }

  res.json(ticket);
});

export const addTicketComment = asyncHandler(async (req, res) => {
  if (!req.body.text?.trim()) throw new ApiError(400, "Comment is required.");
  const ticket = await prisma.ticket.findFirst({ where: { id: req.params.id, ...(await scope(req)) } });
  if (!ticket) throw new ApiError(404, "Ticket not found.");
  await prisma.ticketComment.create({ data: { ticketId: ticket.id, authorId: req.user.id, text: req.body.text.trim() } });
  const updated = await prisma.ticket.findUnique({ where: { id: ticket.id }, include: INCLUDE });
  const recipients = [...new Set([ticket.assigneeId, ticket.createdById].filter(id => id && id !== req.user.id))];
  await notifyMany({ userIds: recipients, type: "TICKET_UPDATED", title: "New ticket comment", message: `${req.user.name} commented on "${ticket.title}"`, entityType: "ticket", entityId: ticket.id });
  res.status(201).json(updated);
});
