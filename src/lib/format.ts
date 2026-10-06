const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export const formatNaira = (n: number) => naira.format(n);

export const formatTime = (d: Date) =>
  d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

/** "Fri 9 Oct" */
export const formatDay = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** "Today", "Tomorrow" or "Fri 9 Oct" */
export function formatRelativeDay(d: Date, now = new Date()): string {
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(d) - start(now)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return formatDay(d);
}

export const formatWhen = (d: Date, now = new Date()) => `${formatRelativeDay(d, now)}, ${formatTime(d)}`;

export const formatKm = (km: number) => `${km.toFixed(km < 10 ? 1 : 0)} km`;

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** "+2348034567812" → "+234 803 456 7812" */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+234(\d{3})(\d{3})(\d{4})$/);
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : e164;
}

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
