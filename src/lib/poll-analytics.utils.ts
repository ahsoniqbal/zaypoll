import { differenceInHours, differenceInDays, format, startOfHour, startOfDay, startOfWeek, addHours, addDays, addWeeks } from "date-fns";
import type { AudienceItem, DeviceType, TimelineGranularity, VoteTimelinePoint } from "@/types/poll-analytics.types";

export function safePercentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 1000) / 10 : 0;
}

export function timelineGranularity(createdAt: Date, now = new Date()): TimelineGranularity {
  const hours = differenceInHours(now, createdAt);
  if (hours < 48) return "hour";
  if (differenceInDays(now, createdAt) <= 60) return "day";
  return "week";
}

function intervalStart(date: Date, granularity: TimelineGranularity) {
  if (granularity === "hour") return startOfHour(date);
  if (granularity === "day") return startOfDay(date);
  return startOfWeek(date, { weekStartsOn: 1 });
}

function intervalKey(date: Date, granularity: TimelineGranularity) {
  return granularity === "hour" ? format(date, "yyyy-MM-dd HH:00") : format(date, "yyyy-MM-dd");
}

export function fillTimelineIntervals(
  rows: Array<{ period: string | Date; voteCount: number }>,
  createdAt: Date,
  granularity: TimelineGranularity,
  now = new Date(),
): VoteTimelinePoint[] {
  const counts = new Map(rows.map((row) => [intervalKey(new Date(row.period), granularity), Number(row.voteCount)]));
  const points: VoteTimelinePoint[] = [];
  const add = granularity === "hour" ? addHours : granularity === "day" ? addDays : addWeeks;
  let cursor = intervalStart(createdAt, granularity);
  const end = intervalStart(now, granularity);
  const maximumPoints = granularity === "hour" ? 49 : granularity === "day" ? 62 : 160;
  while (cursor <= end && points.length < maximumPoints) {
    const period = intervalKey(cursor, granularity);
    points.push({
      period: cursor.toISOString(),
      label: granularity === "hour" ? format(cursor, "MMM d, HH:mm") : granularity === "day" ? format(cursor, "MMM d") : `Week of ${format(cursor, "MMM d")}`,
      voteCount: counts.get(period) ?? 0,
    });
    cursor = add(cursor, 1);
  }
  return points;
}

export function groupTopLocations(items: AudienceItem[], limit = 5): AudienceItem[] {
  if (items.length <= limit) return items;
  const head = items.slice(0, limit);
  const otherCount = items.slice(limit).reduce((sum, item) => sum + item.count, 0);
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return [...head, { label: "Other", count: otherCount, percentage: safePercentage(otherCount, total) }];
}

export function normalizeCountry(value: string | null): string | null {
  const code = value?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : null;
}

export function countryFromHeaders(getHeader: (name: string) => string | null): string | null {
  const trustedCountry = normalizeCountry(getHeader("x-vercel-ip-country") ?? getHeader("cf-ipcountry"));
  if (trustedCountry) return trustedCountry;
  // Local development servers do not receive deployment geolocation headers.
  // This opt-in override is never honored in production.
  return process.env.NODE_ENV !== "production"
    ? normalizeCountry(process.env.ANALYTICS_DEV_COUNTRY_CODE ?? null)
    : null;
}

export function parseDevice(userAgent: string | null): { deviceType: DeviceType; operatingSystem: string | null } {
  const ua = userAgent ?? "";
  const deviceType: DeviceType = /iPad|Tablet|PlayBook/i.test(ua) ? "tablet" : /Mobi|Android|iPhone/i.test(ua) ? "mobile" : ua ? "desktop" : "unknown";
  const operatingSystem = /Android/i.test(ua) ? "Android" : /iPhone|iPad|iPod/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac OS|Macintosh/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : ua ? "Other" : null;
  return { deviceType, operatingSystem };
}

export function readableDuration(createdAt: Date, now = new Date()) {
  const hours = Math.max(0, differenceInHours(now, createdAt));
  if (hours < 1) return "Less than an hour";
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  const days = differenceInDays(now, createdAt);
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  const weeks = Math.floor(days / 7);
  return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}
