const DIVISIONS = [
  { amount: 60, name: "seconds" as const },
  { amount: 60, name: "minutes" as const },
  { amount: 24, name: "hours" as const },
  { amount: 7, name: "days" as const },
  { amount: 4.34524, name: "weeks" as const },
  { amount: 12, name: "months" as const },
  { amount: Number.POSITIVE_INFINITY, name: "years" as const },
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeTime(date: Date | string): string {
  const target = typeof date === "string" ? new Date(date) : date;
  let duration = (target.getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
  return rtf.format(Math.round(duration), "years");
}
