export function generateICS({
  title,
  description,
  start,
  end
}: {
  title: string;
  description?: string;
  start: Date;
  end: Date;
}) {
  function format(dt: Date) {
    const pad = (n: number) => `${n}`.padStart(2, "0");
    return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
  }
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//lumpsum.in//EN",
    "BEGIN:VEVENT",
    `DTSTAMP:${format(new Date())}`,
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description}` : undefined,
    "END:VEVENT",
    "END:VCALENDAR"
  ]
    .filter(Boolean)
    .join("\r\n");
  return ics;
}

export function downloadICS(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function googleCalendarLink({
  title,
  details,
  start,
  end
}: {
  title: string;
  details?: string;
  start: Date;
  end: Date;
}) {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]|\.\d{3}/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`
  });
  if (details) params.set("details", details);
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
