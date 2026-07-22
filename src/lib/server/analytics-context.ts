import { cookies, headers } from "next/headers";
import { countryFromHeaders, parseDevice } from "@/lib/poll-analytics.utils";
import type { AnalyticsEventContext } from "@/types/poll-analytics.types";

export const ANALYTICS_SESSION_COOKIE = "zaypoll_analytics_session";

export async function getAnalyticsEventContext(): Promise<AnalyticsEventContext> {
  const [requestHeaders, cookieStore] = await Promise.all([headers(), cookies()]);
  const countryCode = countryFromHeaders((name) => requestHeaders.get(name));
  const device = parseDevice(requestHeaders.get("user-agent"));
  return { sessionId: cookieStore.get(ANALYTICS_SESSION_COOKIE)?.value ?? null, countryCode, ...device };
}
