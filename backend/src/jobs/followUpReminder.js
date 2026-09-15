import prisma from "../config/db.js";
import { notify } from "../services/notificationService.js";

export async function runFollowUpReminderJob() {
  const now = new Date();

  const [dueLeads, dueAccounts] = await Promise.all([
    prisma.lead.findMany({
      where: {
        followUpDate: {
          lte: now,
        },
        cyvoraAMId: {
          not: null,
        },
      },
      select: {
        id: true,
        customerName: true,
        followUpDate: true,
        cyvoraAMId: true,
      },
    }),

    prisma.account.findMany({
      where: {
        followUpDate: {
          lte: now,
        },
        cyvoraAMId: {
          not: null,
        },
      },
      select: {
        id: true,
        customerName: true,
        followUpDate: true,
        cyvoraAMId: true,
      },
    }),
  ]);

  for (const lead of dueLeads) {
    await notifyFollowUp({
      entityType: "lead",
      entityId: lead.id,
      userId: lead.cyvoraAMId,
      followUpDate: lead.followUpDate,
      customerName: lead.customerName,
    });
  }

  for (const account of dueAccounts) {
    await notifyFollowUp({
      entityType: "account",
      entityId: account.id,
      userId: account.cyvoraAMId,
      followUpDate: account.followUpDate,
      customerName: account.customerName,
    });
  }
}

async function notifyFollowUp({
  entityType,
  entityId,
  userId,
  followUpDate,
  customerName,
}) {
  if (!followUpDate || !userId) return;

  const now = new Date();
  const scheduledDate = new Date(followUpDate);

  if (scheduledDate > now) return;

  const reminderKey = [
    entityType,
    entityId,
    scheduledDate.toISOString(),
  ].join(":");

  const alreadySent = await prisma.notification.findUnique({
    where: {
      reminderKey,
    },
    select: {
      id: true,
    },
  });

  if (alreadySent) return;

  const formattedDate = formatFollowUpDate(scheduledDate);
  const isOverdue = scheduledDate < now;

  await notify({
    userId,
    type: "FOLLOW_UP_REMINDER",

    title: isOverdue
      ? "Follow-up overdue"
      : "Follow-up due",

    message: isOverdue
      ? `Follow-up for "${customerName}" was scheduled for ${formattedDate} and is overdue.`
      : `Follow-up for "${customerName}" is due at ${formattedDate}.`,

    entityType,
    entityId,

    reminderKey,
  });
}

function formatFollowUpDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}

function formatFollowUpKey(date) {
  return new Date(date).toISOString();
}