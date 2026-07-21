import type {
  Adapter,
  AdapterAccount,
  AdapterUser,
  VerificationToken,
} from "@auth/core/adapters";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/db";

type AuthUserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  email_verified: Date | null;
  image: string | null;
  user_name: string;
};

type VerificationTokenRow = RowDataPacket & {
  identifier: string;
  token: string;
  expires: Date;
};

function mapUser(row: AuthUserRow): AdapterUser {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    emailVerified: row.email_verified,
    image: row.image,
    userName: row.user_name,
  } as AdapterUser;
}

async function findUserById(id: string): Promise<AdapterUser | null> {
  const [rows] = await pool.query<AuthUserRow[]>(
    "SELECT id, name, email, email_verified, image, user_name FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

async function uniqueUsername(name: string, email: string): Promise<string> {
  const source = name.trim() || email.split("@")[0] || "user";
  const base = source
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-") || "user";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT user_name FROM users
     WHERE user_name = ? OR user_name LIKE ?`,
    [base, `${base}-%`],
  );

  const used = new Set(rows.map((row) => String(row.user_name)));
  if (!used.has(base)) return base;

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function MySqlAuthAdapter(): Adapter {
  return {
    async createUser(user) {
      const name = user.name?.trim() || user.email.split("@")[0] || "User";
      const userName = await uniqueUsername(name, user.email);
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO users (name, email, email_verified, image, user_name)
         VALUES (?, ?, ?, ?, ?)`,
        [name, user.email, user.emailVerified ?? null, user.image ?? null, userName],
      );

      return {
        ...user,
        id: String(result.insertId),
        name,
        emailVerified: user.emailVerified ?? null,
        image: user.image ?? null,
        userName,
      } as AdapterUser;
    },

    async getUser(id) {
      return findUserById(id);
    },

    async getUserByEmail(email) {
      const [rows] = await pool.query<AuthUserRow[]>(
        "SELECT id, name, email, email_verified, image, user_name FROM users WHERE email = ? LIMIT 1",
        [email],
      );
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const [rows] = await pool.query<AuthUserRow[]>(
        `SELECT u.id, u.name, u.email, u.email_verified, u.image, u.user_name
         FROM accounts a
         INNER JOIN users u ON u.id = a.user_id
         WHERE a.provider = ? AND a.provider_account_id = ?
         LIMIT 1`,
        [provider, providerAccountId],
      );
      return rows[0] ? mapUser(rows[0]) : null;
    },

    async updateUser(user) {
      const current = await findUserById(user.id);
      if (!current) throw new Error("Cannot update a user that does not exist");

      const next = { ...current, ...user };
      await pool.execute(
        `UPDATE users
         SET name = ?, email = ?, email_verified = ?, image = ?
         WHERE id = ?`,
        [next.name ?? "User", next.email, next.emailVerified ?? null, next.image ?? null, user.id],
      );
      return next as AdapterUser;
    },

    async linkAccount(account) {
      await pool.execute(
        `INSERT INTO accounts
          (user_id, type, provider, provider_account_id, refresh_token, access_token,
           expires_at, token_type, scope, id_token, session_state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           user_id = VALUES(user_id), refresh_token = VALUES(refresh_token),
           access_token = VALUES(access_token), expires_at = VALUES(expires_at),
           token_type = VALUES(token_type), scope = VALUES(scope),
           id_token = VALUES(id_token), session_state = VALUES(session_state)`,
        [
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token ?? null,
          account.access_token ?? null,
          account.expires_at ?? null,
          account.token_type ?? null,
          account.scope ?? null,
          account.id_token ?? null,
          account.session_state == null ? null : String(account.session_state),
        ],
      );
      return account as AdapterAccount;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await pool.execute(
        "DELETE FROM accounts WHERE provider = ? AND provider_account_id = ?",
        [provider, providerAccountId],
      );
    },

    async createVerificationToken(token) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute(
          "DELETE FROM verification_tokens WHERE identifier = ?",
          [token.identifier],
        );
        await connection.execute(
          "DELETE FROM verification_tokens WHERE expires < NOW() LIMIT 500",
        );
        await connection.execute(
          `INSERT INTO verification_tokens (identifier, token, expires)
           VALUES (?, ?, ?)`,
          [token.identifier, token.token, token.expires],
        );
        await connection.commit();
        return token;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },

    async useVerificationToken({ identifier, token }) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.query<VerificationTokenRow[]>(
          `SELECT identifier, token, expires
           FROM verification_tokens
           WHERE identifier = ? AND token = ?
           FOR UPDATE`,
          [identifier, token],
        );

        if (!rows[0]) {
          await connection.rollback();
          return null;
        }

        await connection.execute(
          "DELETE FROM verification_tokens WHERE identifier = ? AND token = ?",
          [identifier, token],
        );
        await connection.commit();
        return rows[0] as VerificationToken;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
  };
}
