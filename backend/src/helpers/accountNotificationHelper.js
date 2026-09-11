import { notifyMany } from "../services/notificationService.js";
import { getDepartmentStakeholderIds } from "./notificationScopeHelper.js";

export async function notifyAccountStakeholders({
  account,
  actor,
  type,
  title,
  message,
}) {
  const userIds = await getDepartmentStakeholderIds({
    departmentId: account.departmentId,
    cyvoraAMId: account.cyvoraAMId,
    actorId: actor?.id,
  });

  await notifyMany({
    userIds,
    type,
    title,
    message,
    entityType: "account",
    entityId: account.id,
  });
}