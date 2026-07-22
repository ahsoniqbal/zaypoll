import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { AppError } from "@/lib/error";
import { Notification, NotificationData, NotificationType } from "@/types/notification.types";

export type CreateNotificationDto = {
    userId: number;
    actorUserId?: number | null;
    type: NotificationType;
    referenceType: string;
    referenceId: number;
    data?: NotificationData;
};


function safeParseJSON(value: unknown): NotificationData | undefined {
    try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        return parsed && typeof parsed === "object"
            ? parsed as NotificationData
            : undefined;
    } catch {
        return undefined;
    }
}

type NotificationRow = RowDataPacket & {
    id: number;
    type: NotificationType;
    is_read: number;
    created_at: string;
    actor_username: string | null;
    reference_type: string;
    reference_id: number;
    related_poll_id: number | null;
    data: unknown;
};

type CountRow = RowDataPacket & { count: number };

function toNotification(row: NotificationRow): Notification {
    return {
        id: row.id,
        type: row.type,
        is_read: row.is_read,
        created_at: row.created_at,
        actor_username: row.actor_username ?? undefined,
        reference_type: row.reference_type,
        reference_id: row.reference_id,
        related_poll_id: row.related_poll_id,
        data: safeParseJSON(row.data),
    };
}

export async function createNotification(dto: CreateNotificationDto) {
    const {
        userId,
        actorUserId = null,
        type,
        referenceType,
        referenceId,
        data,
    } = dto;

    // prevent self-notification
    if (userId === actorUserId) return;

    await pool.execute<ResultSetHeader>(
        `
    INSERT INTO notifications
    (user_id, actor_user_id, type, reference_type, reference_id, data, is_read)
    VALUES (?, ?, ?, ?, ?, ?, 0)
    `,
        [
            userId,
            actorUserId,
            type,
            referenceType,
            referenceId,
            data ? JSON.stringify(data) : null,
        ]
    );
}


export async function getNotifications(userId: number, limit: number = 20): Promise<Notification[]> {
    const [rows] = await pool.query<NotificationRow[]>(
        `SELECT n.*, u.user_name as actor_username, po.poll_id as related_poll_id
        FROM notifications n
            LEFT JOIN users u ON u.id = n.actor_user_id
            LEFT JOIN option_comments oc
              ON n.reference_type = 'COMMENT' AND oc.id = n.reference_id
            LEFT JOIN poll_options po ON po.id = oc.option_id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT ?`,
        [userId, limit]
    );

    return rows.map(toNotification);
}

export async function getUnreadCount(userId: number): Promise<number> {
    const [rows] = await pool.query<CountRow[]>(
        `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = ? AND is_read = 0
    `,
        [userId]
    );

    return rows?.[0]?.count ?? 0;
}

export async function getNotificationBundle(userId: number, limit = 20): Promise<{
    notifications: Notification[];
    unreadCount: number;
}> {

    const [notificationsRes, countRes] = await Promise.all([
        pool.query<NotificationRow[]>(
            `
     SELECT n.*, u.user_name as actor_username, po.poll_id as related_poll_id
FROM notifications n
LEFT JOIN users u ON u.id = n.actor_user_id
LEFT JOIN option_comments oc
  ON n.reference_type = 'COMMENT' AND oc.id = n.reference_id
LEFT JOIN poll_options po ON po.id = oc.option_id
WHERE n.user_id = ?
ORDER BY n.created_at DESC
LIMIT ?
      `,
            [userId, limit]
        ),

        pool.query<CountRow[]>(
            `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND is_read = 0
      `,
            [userId]
        ),
    ]);

    const notifications = notificationsRes[0].map(toNotification);

    return {
        notifications,
        unreadCount: countRes[0][0]?.count ?? 0,
    };
}


export async function markAsRead(userId: number, notificationId: number) {
    const [result] = await pool.execute<ResultSetHeader>(
        `
    UPDATE notifications
    SET 
      is_read = 1,
      read_at = COALESCE(read_at, NOW())
    WHERE id = ? AND user_id = ?
    `,
        [notificationId, userId]
    );

    if (result.affectedRows === 0) {
        throw new AppError("Notification not found", 404);
    }

    return true;
}


export async function markAllAsRead(userId: number) {
    await pool.execute(
        `
    UPDATE notifications
    SET is_read = 1,
        read_at = COALESCE(read_at, NOW())
    WHERE user_id = ? AND is_read = 0
    `,
        [userId]
    );

    return true;
}
