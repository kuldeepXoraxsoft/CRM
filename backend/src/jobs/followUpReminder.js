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
  const alreadySent = await prisma.notification.findFirst({
    where: {
      userId,
      type: "FOLLOW_UP_REMINDER",
      entityType,
      entityId,
      message: {
        contains: formatFollowUpKey(followUpDate),
      },
    },
  });

  if (alreadySent) return;

  const now = new Date();

  const isOverdue = followUpDate < now;

  const formattedDate = formatFollowUpDate(followUpDate);
  const followUpKey = formatFollowUpKey(followUpDate);

  await notify({
    userId,
    type: "FOLLOW_UP_REMINDER",

    title: isOverdue
      ? "Follow-up overdue"
      : "Follow-up due",

    message: isOverdue
      ? `Follow-up for "${customerName}" was scheduled for ${formattedDate} and is overdue. [${followUpKey}]`
      : `Follow-up for "${customerName}" is due at ${formattedDate}. [${followUpKey}]`,

    entityType,
    entityId,
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