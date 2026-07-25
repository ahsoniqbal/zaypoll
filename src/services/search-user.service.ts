import type { RowDataPacket } from "mysql2";

import pool from "@/lib/db";
import type { PagedResponse } from "@/types/common.types";

export type UserSearchResult = {
  id: number;
  name: string;
  userName: string;
  image: string | null;
  followersCount: number;
};

type UserSearchRow = RowDataPacket & {
  id: number;
  name: string;
  user_name: string;
  image: string | null;
  followers_count: number | string | null;
};

type CountRow = RowDataPacket & {
  total: number | string;
};

export async function searchUsers(
  search: string,
  page = 1,
  limit = 10,
): Promise<PagedResponse<UserSearchResult>> {
  const normalizedSearch = search.trim().replace(/\s+/g, " ").slice(0, 100);
  const escapedSearch = normalizedSearch.replace(/[\\%_]/g, "\\$&");
  const prefixSearch = `${escapedSearch}%`;
  const containsSearch = `%${escapedSearch}%`;
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) ? Math.min(50, Math.max(1, limit)) : 10;
  const offset = (safePage - 1) * safeLimit;

  const [rowsResult, countResult] = await Promise.all([
    pool.query<UserSearchRow[]>(
      `
        SELECT id, name, user_name, image, followers_count
        FROM users
        WHERE user_name LIKE ? OR name LIKE ?
        ORDER BY
          CASE
            WHEN LOWER(user_name) = LOWER(?) THEN 0
            WHEN user_name LIKE ? THEN 1
            WHEN LOWER(name) = LOWER(?) THEN 2
            WHEN name LIKE ? THEN 3
            ELSE 4
          END ASC,
          followers_count DESC,
          user_name ASC,
          id ASC
        LIMIT ? OFFSET ?
      `,
      [
        containsSearch,
        containsSearch,
        normalizedSearch,
        prefixSearch,
        normalizedSearch,
        prefixSearch,
        safeLimit,
        offset,
      ],
    ),
    pool.query<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM users
        WHERE user_name LIKE ? OR name LIKE ?
      `,
      [containsSearch, containsSearch],
    ),
  ]);

  const rows = rowsResult[0];
  const total = Number(countResult[0][0]?.total ?? 0);
  const totalPages = Math.ceil(total / safeLimit);

  return {
    data: rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      userName: row.user_name,
      image: row.image,
      followersCount: Number(row.followers_count ?? 0),
    })),
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}
