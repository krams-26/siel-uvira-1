import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditLogs,
  dossierEvents,
  dossiers,
  notifications,
  offices,
  permissions,
  rolePermissions,
  schools,
  sequences,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn };
  if (user.role) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return rows[0];
}

export async function hasPermission(userId: number, role: string, permissionCode: string) {
  if (role === "admin") return true;
  const db = await getDb(); if (!db) return false;
  const rows = await db.select({ id: permissions.id }).from(permissions).innerJoin(
    rolePermissions,
    eq(rolePermissions.permissionId, permissions.id),
  ).where(and(eq(permissions.code, permissionCode), eq(rolePermissions.role, role))).limit(1);
  return rows.length > 0;
}

export async function nextSequence(namespace: string, year: number, prefix: string) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  return db.transaction(async tx => {
    const current = await tx.select().from(sequences).where(and(eq(sequences.namespace, namespace), eq(sequences.year, year))).limit(1);
    if (current[0]) {
      const value = current[0].nextValue;
      await tx.update(sequences).set({ nextValue: value + 1 }).where(eq(sequences.id, current[0].id));
      return `${prefix}${String(value).padStart(current[0].padding, "0")}/${year}`;
    }
    await tx.insert(sequences).values({ namespace, year, prefix, nextValue: 2, padding: 4 });
    return `${prefix}${String(1).padStart(4, "0")}/${year}`;
  });
}

export async function createAudit(input: { actorId?: number; action: string; entityType: string; entityId?: number; beforeData?: unknown; afterData?: unknown; ipAddress?: string }) {
  const db = await getDb(); if (!db) return;
  await db.insert(auditLogs).values({ actorId: input.actorId, action: input.action, entityType: input.entityType, entityId: input.entityId, beforeData: input.beforeData ? JSON.stringify(input.beforeData) : null, afterData: input.afterData ? JSON.stringify(input.afterData) : null, ipAddress: input.ipAddress });
}

export async function listSchools(search?: string) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(schools).where(search ? or(like(schools.officialName, `%${search}%`), like(schools.code, `%${search}%`), like(schools.directorName, `%${search}%`)) : undefined).orderBy(desc(schools.updatedAt));
}

export async function listDossiers() {
  const db = await getDb(); if (!db) return [];
  return db.select({ dossier: dossiers, office: offices, school: schools }).from(dossiers).leftJoin(offices, eq(dossiers.currentOfficeId, offices.id)).leftJoin(schools, eq(dossiers.schoolId, schools.id)).orderBy(desc(dossiers.createdAt));
}

export async function unreadNotifications(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false))).orderBy(desc(notifications.createdAt));
}

export { auditLogs, dossierEvents, dossiers, notifications, offices, permissions, schools, users };
