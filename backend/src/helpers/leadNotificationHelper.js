import { notifyMany } from "../services/notificationService.js";
import { getDepartmentStakeholderIds } from "./notificationScopeHelper.js";

export async function notifyLeadStakeholders({
  lead,
  actor,
  type,
  title,
  message,
}) {
  const userIds = await getDepartmentStakeholderIds({
    departmentId: lead.departmentId,
    cyvoraAMId: lead.cyvoraAMId,
    actorId: actor?.id,
  });

  await notifyMany({
    userIds,
    type,
    title,
    message,
    entityType: "lead",
    entityId: lead.id,
  });
}