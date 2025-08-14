"use client";
/**
 * CalendarButton – creates a monthly investment reminder using Google Calendar deep link.
 * For API-based integration, replace with a route invoking Google Calendar API with FreeBusy check.
 */
export function CalendarButton({ title = "Investment Reminder" }: { title?: string }) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15, 0);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(
      d.getUTCHours()
    ).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}00Z`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${fmt(start)}/${fmt(end)}&recur=RRULE:FREQ=MONTHLY`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
    >
      Add to Google Calendar
    </a>
  );
}
