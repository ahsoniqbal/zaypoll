import pool from "@/lib/db";
import { ResultSetHeader } from "mysql2";
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


function safeParseJSON(value: any) {
    try {
        return typeof value === "string" ? JSON.parse(value) : value;
    } catch {
        return null;
    }
}

export type NotificationDto = {
    id: number;
    type: NotificationType;
    is_read: number;
    created_at: string;
    actorUserName?: string;
    data?: NotificationData;
};

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
    const [rows]: any = await pool.query(
        `SELECT n.*, u.user_name as actor_username FROM notifications n
            LEFT JOIN users u ON u.id = n.actor_user_id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT ?`,
        [userId, limit]
    );

    return rows.map((n: any) => ({
        ...n,
        data: safeParseJSON(n.data),
    }));
}

export async function getUnreadCount(userId: number): Promise<number> {
    const [rows]: any = await pool.query(
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

    const [notificationsRes, countRes]: any = await Promise.all([
        pool.query(
            `
     SELECT n.*, u.user_name as actor_username
FROM notifications n
LEFT JOIN users u ON u.id = n.actor_user_id
WHERE n.user_id = ?
ORDER BY n.created_at DESC
LIMIT ?
      `,
            [userId, limit]
        ),

        pool.query(
            `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND is_read = 0
      `,
            [userId]
        ),
    ]);

    const notifications: Notification[] = notificationsRes[0].map((n: any) => ({
        ...n,
        data: safeParseJSON(n.data),
    }));

    return {
        notifications,
        unreadCount: countRes?.[0][0].count ?? 0,
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
