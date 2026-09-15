/**
 * The backend (Prisma) returns full ISO datetime strings
 * ("2026-08-18T00:00:00.000Z"). DateSelector, native <input type="date">,
 * and our string-range filters all expect plain "YYYY-MM-DD". Use this
 * anywhere an API date value flows into one of those.
 */
export function toDateInputValue(isoString) {
  if (!isoString) return "";
  return String(isoString).slice(0, 10);
}