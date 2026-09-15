/**
 * Applies a follow-up date update to a lead/account entity, keeping a full
 * history of every change (old date -> new date + remark + timestamp).
 *
 * Used by both Leads and Accounts pages so the flow stays identical
 * everywhere follow-up dates exist.
 *
 * @param {object} entity - lead or account object (must have followUpDate, followUpHistory)
 * @param {{ newDate: string, remark: string }} update
 * @returns {object} updated entity (new object, does not mutate original)
 */
export function addFollowUpEntry(entity, { newDate, remark }) {
  const trimmedRemark = (remark || "").trim();

  const historyEntry = {
    id: `fu_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    previousDate: entity.followUpDate || "",
    newDate,
    remark: trimmedRemark,
    updatedAt: new Date().toISOString(),
  };

  return {
    ...entity,
    followUpDate: newDate,
    followUpHistory: [historyEntry, ...(entity.followUpHistory || [])],
  };
}

/**
 * Formats an ISO timestamp into a readable "DD MMM YYYY, HH:MM" string
 * for showing inside the follow-up history timeline.
 */
export function formatHistoryTimestamp(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}