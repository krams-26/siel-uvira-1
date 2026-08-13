import { getDb } from "./db";
import { notifications } from "../drizzle/schema";

export type NotificationChannel = "in_app" | "email" | "sms" | "whatsapp";

export interface NotificationService {
  notify(input: { userId: number; type: string; title: string; body: string; entityType?: string; entityId?: number; channels?: NotificationChannel[] }): Promise<void>;
}

class InAppNotificationService implements NotificationService {
  async notify(input: { userId: number; type: string; title: string; body: string; entityType?: string; entityId?: number }) {
    const db = await getDb();
    if (!db) return;
    await db.insert(notifications).values({ userId: input.userId, type: input.type, title: input.title, body: input.body, entityType: input.entityType, entityId: input.entityId });
  }
}

export const notificationService: NotificationService = new InAppNotificationService();
