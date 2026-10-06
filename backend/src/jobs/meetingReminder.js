import prisma from "../config/db.js";
import { notifyMany } from "../services/notificationService.js";

export async function runMeetingReminderJob() {
  const now = new Date();
  const meetings = await prisma.meeting.findMany({
    where: { status: "Scheduled", startAt: { gt: now, lte: new Date(now.getTime() + 15 * 60 * 1000) } },
    include: { participants: { select: { userId: true } } },
  });
  for (const meeting of meetings) {
    const reminderTime = new Date(meeting.startAt.getTime() - meeting.reminderMinutesBefore * 60000);
    if (reminderTime > now || reminderTime < new Date(now.getTime() - 10 * 60000)) continue;
    const key = `meeting:${meeting.id}:${meeting.startAt.toISOString()}`;
    const sent = await prisma.notification.findFirst({ where: { reminderKey: key }, select: { id: true } });
    if (sent) continue;
    await notifyMany({
      userIds: meeting.participants.map(x => x.userId),
      type: "MEETING_REMINDER",
      title: "Upcoming meeting",
      message: `"${meeting.title}" starts at ${new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kolkata"}).format(meeting.startAt)}.`,
      entityType: "meeting", entityId: meeting.id, reminderKey: key,
    });
  }
}
