import "server-only";

import { createHmac } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";

type RateLimitRow = RowDataPacket & {
  request_count: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

function hashKey(key: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for authentication rate limiting");
  return createHmac("sha256", secret).update(key).digest("hex");
}

export async function consumeAuthRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<boolean> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const expiresAt = new Date(windowStart.getTime() + windowMs * 2);
  const identifierHash = hashKey(key);

  await pool.execute(
    `INSERT INTO auth_rate_limits
      (identifier_hash, window_start, request_count, expires_at)
     VALUES (?, ?, 1, ?)
     ON DUPLICATE KEY UPDATE
       request_count = request_count + 1,
       expires_at = VALUES(expires_at)`,
    [identifierHash, windowStart, expiresAt],
  );

  const [rows] = await pool.query<RateLimitRow[]>(
    `SELECT request_count
     FROM auth_rate_limits
     WHERE identifier_hash = ? AND window_start = ?
     LIMIT 1`,
    [identifierHash, windowStart],
  );

  // Keep the table bounded without adding cleanup work to every request.
  if (Math.random() < 0.02) {
    await pool.execute(
      "DELETE FROM auth_rate_limits WHERE expires_at < NOW() LIMIT 500",
    );
  }

  return Number(rows[0]?.request_count ?? limit + 1) <= limit;
}
