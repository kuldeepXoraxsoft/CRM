import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  res.json(notifications);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: {
      userId: req.user.id,
      isRead: false,
    },
  });

  res.json({ count });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const existing = await prisma.notification.findUnique({
    where: { id: req.params.id },
  });

  if (!existing || existing.userId !== req.user.id) {
    throw new ApiError(404, "Notification not found.");
  }

  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({
    success: true,
    notification,
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({
    success: true,
  });
});

// Single notification delete - only the owning user can delete it.
export const deleteNotification = asyncHandler(async (req, res) => {
  const existing = await prisma.notification.findUnique({
    where: { id: req.params.id },
  });

  if (!existing || existing.userId !== req.user.id) {
    throw new ApiError(404, "Notification not found.");
  }

  await prisma.notification.delete({ where: { id: req.params.id } });

  res.status(204).send();
});

// Bulk clear - wipes every notification for the logged-in user.
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await prisma.notification.deleteMany({
    where: { userId: req.user.id },
  });

  res.status(204).send();
});