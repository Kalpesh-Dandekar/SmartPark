const DISPLAY_TIME_ZONE = "Asia/Kolkata";
const FALLBACK = "—";

export function parseAdminDate(value: string | null | undefined) {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+05:30` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatAdminDate(value: string | null | undefined) {
  const date = parseAdminDate(value);
  return date ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: DISPLAY_TIME_ZONE }).format(date) : FALLBACK;
}

export function formatAdminTime(value: string | null | undefined) {
  const date = parseAdminDate(value);
  return date ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: DISPLAY_TIME_ZONE }).format(date) : FALLBACK;
}

export function formatAdminDateTime(value: string | null | undefined) {
  const date = parseAdminDate(value);
  return date ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: DISPLAY_TIME_ZONE }).format(date) : FALLBACK;
}
