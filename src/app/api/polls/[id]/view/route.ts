import { auth } from "@/auth";
import { ANALYTICS_SESSION_COOKIE } from "@/lib/server/analytics-context";
import { countryFromHeaders, parseDevice } from "@/lib/poll-analytics.utils";
import { trackPollView } from "@/services/poll-analytics.service";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const pollId = Number((await params).id);
  if (!Number.isSafeInteger(pollId) || pollId <= 0) return NextResponse.json({ error: "Invalid poll" }, { status: 400 });
  const session = await auth();
  const existingSessionId = request.cookies.get(ANALYTICS_SESSION_COOKIE)?.value;
  const sessionId = existingSessionId ?? crypto.randomUUID();
  const { deviceType, operatingSystem } = parseDevice(request.headers.get("user-agent"));
  try {
    const inserted = await trackPollView(pollId, session?.user?.id ?? null, {
      sessionId,
      countryCode: countryFromHeaders((name) => request.headers.get(name)),
      deviceType,
      operatingSystem,
    });
    if (inserted) revalidateTag(`poll-analytics:${pollId}`, "max");
  } catch (error) {
    console.error("Poll view tracking failed", error);
    return new NextResponse(null, { status: 204 });
  }
  const response = new NextResponse(null, { status: 204 });
  if (!existingSessionId) response.cookies.set(ANALYTICS_SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return response;
}
