import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activityLogger.js";
import { notifyMany } from "../services/notificationService.js";
import { getPagination } from "../utils/pagination.js";

const USER_SELECT = { id: true, name: true, email: true, role: true, departmentId: true };
const INCLUDE = {
  host: { select: USER_SELECT },
  department: { select: { id: true, name: true } },
  account: { select: { id: true, customerName: true } },
  lead: { select: { id: true, customerName: true } },
  participants: { include: { user: { select: USER_SELECT } } },
};

async function scope(req) {
  if (req.user.role === "superAdmin") return {};
  if (!req.user.departmentId) return { departmentId: "__NO_DEPARTMENT__" };
  if (req.user.role === "admin") return { departmentId: req.user.departmentId };
  if (req.user.role === "manager") {
    const employees = await prisma.user.findMany({ where: { managerId: req.user.id }, select: { id: true } });
    return { departmentId: req.user.departmentId, OR: [
      { hostId: req.user.id },
      { participants: { some: { userId: req.user.id } } },
      { hostId: { in: employees.map(x => x.id) } },
      { participants: { some: { userId: { in: employees.map(x => x.id) } } } },
    ]};
  }
  return { departmentId: req.user.departmentId, OR: [
    { hostId: req.user.id }, { participants: { some: { userId: req.user.id } } }
  ]};
}

export const listMeetings = asyncHandler(async (req, res) => {
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
              { host: { name: { contains: search, mode: "insensitive" } } },
            ],
          },
        ],
      }
    : scopeWhere;

  const [meetings, total] = await prisma.$transaction([
    prisma.meeting.findMany({ where, include: INCLUDE, orderBy: { startAt: "asc" }, skip, take: limit }),
    prisma.meeting.count({ where }),
  ]);
  const totalPages = Math.ceil(total / limit);
  res.json({ data: meetings, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } });
});

export const createMeeting = asyncHandler(async (req, res) => {
  const { title, description, startAt, durationMinutes = 30, location, meetingUrl, reminderMinutesBefore = 15, participantIds = [], accountId, leadId } = req.body;
  if (!title?.trim() || !startAt) throw new ApiError(400, "Title and start time are required.");

  const departmentId = req.user.departmentId;
  if (!departmentId && req.user.role !== "superAdmin") throw new ApiError(400, "User has no department.");

  const ids = [...new Set([req.user.id, ...participantIds].filter(Boolean))];
  const users = await prisma.user.findMany({ where: { id: { in: ids }, status: "Active" }, select: USER_SELECT });
  if (users.length !== ids.length) throw new ApiError(400, "One or more participants are invalid.");

  if (req.user.role !== "superAdmin" && users.some(u => u.departmentId !== departmentId))
    throw new ApiError(403, "Meeting participants must belong to your department.");

  const meeting = await prisma.meeting.create({
    data: {
      title: title.trim(), description: description?.trim() || null, startAt: new Date(startAt),
      durationMinutes: Number(durationMinutes) || 30, location: location?.trim() || null,
      meetingUrl: meetingUrl?.trim() || null, reminderMinutesBefore: Number(reminderMinutesBefore) || 15,
      departmentId: departmentId || users[0]?.departmentId, hostId: req.user.id,
      accountId: accountId || null, leadId: leadId || null,
      participants: { create: ids.map(userId => ({ userId })) },
    },
    include: INCLUDE,
  });

  const recipients = ids.filter(id => id !== req.user.id);
  await notifyMany({ userIds: recipients, type: "MEETING_INVITE", title: "Meeting invitation",
    message: `${req.user.name} invited you to "${meeting.title}"`, entityType: "meeting", entityId: meeting.id });
  await logActivity(req.user.id, `${req.user.name} scheduled "${meeting.title}"`, "meeting", departmentId);
  res.status(201).json(meeting);
});

export const updateMeeting = asyncHandler(async (req, res) => {
  const existing = await prisma.meeting.findUnique({ where: { id: req.params.id }, include: { participants: true } });
  if (!existing) throw new ApiError(404, "Meeting not found.");
  const allowed = req.user.role === "superAdmin" || existing.hostId === req.user.id;
  if (!allowed) throw new ApiError(403, "Only the meeting host can edit it.");

  const { title, description, startAt, durationMinutes, location, meetingUrl, reminderMinutesBefore, participantIds, status, accountId, leadId } = req.body;
  const ids = participantIds ? [...new Set([req.user.id, ...participantIds].filter(Boolean))] : null;

  if (ids) {
    const users = await prisma.user.findMany({ where: { id: { in: ids }, status: "Active" }, select: USER_SELECT });
    if (users.length !== ids.length) throw new ApiError(400, "One or more participants are invalid.");
    if (req.user.role !== "superAdmin" && users.some((user) => user.departmentId !== req.user.departmentId)) {
      throw new ApiError(403, "Meeting participants must belong to your department.");
    }
  }

  const meeting = await prisma.$transaction(async tx => {
    if (ids) {
      await tx.meetingParticipant.deleteMany({ where: { meetingId: existing.id, userId: { notIn: ids } } });
      const current = await tx.meetingParticipant.findMany({ where: { meetingId: existing.id }, select: { userId: true } });
      const currentIds = new Set(current.map(x => x.userId));
      await tx.meetingParticipant.createMany({ data: ids.filter(id => !currentIds.has(id)).map(userId => ({ meetingId: existing.id, userId })) });
    }
    return tx.meeting.update({
      where: { id: existing.id },
      data: {
        title: title?.trim(), description: description?.trim() || null,
        startAt: startAt ? new Date(startAt) : undefined,
        durationMinutes: durationMinutes == null ? undefined : Number(durationMinutes),
        location: location?.trim() || null, meetingUrl: meetingUrl?.trim() || null,
        reminderMinutesBefore: reminderMinutesBefore == null ? undefined : Number(reminderMinutesBefore),
        status: status || undefined, accountId: accountId || null, leadId: leadId || null,
      }, include: INCLUDE,
    });
  });
  res.json(meeting);
});

export const cancelMeeting = asyncHandler(async (req, res) => {
  const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id } });
  if (!meeting) throw new ApiError(404, "Meeting not found.");
  if (req.user.role !== "superAdmin" && meeting.hostId !== req.user.id) throw new ApiError(403, "Only the meeting host can cancel it.");
  const updated = await prisma.meeting.update({ where: { id: meeting.id }, data: { status: "Cancelled" }, include: INCLUDE });
  const ids = (await prisma.meetingParticipant.findMany({ where: { meetingId: meeting.id }, select: { userId: true } })).map(x => x.userId).filter(id => id !== req.user.id);
  await notifyMany({ userIds: ids, type: "MEETING_INVITE", title: "Meeting cancelled", message: `"${meeting.title}" was cancelled.`, entityType: "meeting", entityId: meeting.id });
  res.json(updated);
});

export const deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id } });
  if (!meeting) throw new ApiError(404, "Meeting not found.");
  if (req.user.role !== "superAdmin" && meeting.hostId !== req.user.id) throw new ApiError(403, "Only the meeting host can delete it.");
  await prisma.meeting.delete({ where: { id: meeting.id } });
  res.status(204).send();
});

export const respondToMeeting = asyncHandler(async (req, res) => {
  const response = req.body.response;
  if (!["Accepted", "Declined", "Pending"].includes(response)) throw new ApiError(400, "Invalid response.");
  const participant = await prisma.meetingParticipant.findUnique({ where: { meetingId_userId: { meetingId: req.params.id, userId: req.user.id } } });
  if (!participant) throw new ApiError(403, "You are not a participant in this meeting.");
  const updated = await prisma.meetingParticipant.update({ where: { id: participant.id }, data: { response }, include: { user: { select: USER_SELECT } } });
  res.json(updated);
});
