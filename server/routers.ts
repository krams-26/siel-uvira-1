import { COOKIE_NAME } from "@shared/const";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { dossierEvents, dossiers, notifications, offices, schools } from "../drizzle/schema";
import { createAudit, getDb, listDossiers, listSchools, nextSequence, unreadNotifications } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "./db";
import { notificationService } from "./notificationService";

const permissionGuard = (roles: string[], permission?: string) => protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user || (!roles.includes(ctx.user.role) && ctx.user.role !== "admin")) throw new TRPCError({ code: "FORBIDDEN" });
  if (permission && !(await hasPermission(ctx.user.id, ctx.user.role, permission))) throw new TRPCError({ code: "FORBIDDEN", message: `Permission requise : ${permission}` });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: permissionGuard(["sous_proved", "secretariat", "chef_bureau", "ops", "inspecteur"]).query(async () => {
    const db = await getDb(); if (!db) return { schools: 0, dossiers: 0, urgent: 0, pendingSignature: 0 };
    const [schoolRows, dossierRows, urgentRows, signatureRows] = await Promise.all([
      db.select({ id: schools.id }).from(schools),
      db.select({ id: dossiers.id }).from(dossiers),
      db.select({ id: dossiers.id }).from(dossiers).where(eq(dossiers.priority, "urgent")),
      db.select({ id: dossiers.id }).from(dossiers).where(eq(dossiers.status, "ready_signature")),
    ]);
    return { schools: schoolRows.length, dossiers: dossierRows.length, urgent: urgentRows.length, pendingSignature: signatureRows.length };
  }),
  schools: router({
    list: permissionGuard(["sous_proved", "secretariat", "chef_bureau", "inspecteur", "ecole"], "schools.view").input(z.object({ search: z.string().optional() }).optional()).query(({ input }) => listSchools(input?.search)),
    create: permissionGuard(["sous_proved", "secretariat", "admin"], "schools.create").input(z.object({ code: z.string().min(2), officialName: z.string().min(2), schoolType: z.string().min(2), level: z.string().min(2), directorName: z.string().optional(), territory: z.string().optional(), commune: z.string().optional(), status: z.string().default("active") })).mutation(async ({ input, ctx }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(schools).values({ ...input, createdBy: ctx.user.id });
      await createAudit({ actorId: ctx.user.id, action: "SCHOOL_CREATED", entityType: "school", entityId: Number(result[0].insertId), afterData: input });
      return { id: Number(result[0].insertId) };
    }),
  }),
  dossiers: router({
    list: permissionGuard(["sous_proved", "secretariat", "chef_bureau", "ops", "inspecteur"], "dossiers.view").query(() => listDossiers()),
    create: permissionGuard(["sous_proved", "secretariat", "admin"], "courriers.create").input(z.object({ subject: z.string().min(3), sender: z.string().min(2), source: z.string().min(2), description: z.string().optional(), externalReference: z.string().optional(), schoolId: z.number().optional(), priority: z.enum(["normal", "high", "urgent"]).default("normal"), dueAt: z.date().optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const year = new Date().getUTCFullYear();
      const reference = await nextSequence("courrier-entrant", year, "S-DIV/UVR/");
      const result = await db.insert(dossiers).values({ ...input, reference, createdBy: ctx.user.id });
      const id = Number(result[0].insertId);
      await db.insert(dossierEvents).values({ dossierId: id, action: "RECEIVED", toStatus: "received", actorId: ctx.user.id, comment: "Dossier enregistré" });
      await createAudit({ actorId: ctx.user.id, action: "DOSSIER_CREATED", entityType: "dossier", entityId: id, afterData: { ...input, reference } });
      return { id, reference };
    }),
    transition: permissionGuard(["sous_proved", "secretariat", "chef_bureau", "ops"], "dossiers.transition").input(z.object({ id: z.number(), status: z.string(), officeId: z.number().optional(), comment: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const current = await db.select().from(dossiers).where(eq(dossiers.id, input.id)).limit(1);
      if (!current[0]) throw new TRPCError({ code: "NOT_FOUND" });
      const transitions: Record<string, string[]> = { received: ["oriented", "rejected"], oriented: ["in_progress", "to_complete", "rejected"], in_progress: ["technical_opinion", "to_complete", "rejected"], technical_opinion: ["ops_drafting"], ops_drafting: ["ready_signature"], ready_signature: ["signed", "rejected"], signed: ["dispatched"], dispatched: ["archived"] };
      if (!transitions[current[0].status]?.includes(input.status)) throw new TRPCError({ code: "BAD_REQUEST", message: `Transition interdite : ${current[0].status} → ${input.status}` });
      await db.update(dossiers).set({ status: input.status, currentOfficeId: input.officeId ?? current[0].currentOfficeId }).where(eq(dossiers.id, input.id));
      await db.insert(dossierEvents).values({ dossierId: input.id, action: input.status.toUpperCase(), fromStatus: current[0].status, toStatus: input.status, fromOfficeId: current[0].currentOfficeId, toOfficeId: input.officeId, actorId: ctx.user.id, comment: input.comment });
      await createAudit({ actorId: ctx.user.id, action: "DOSSIER_TRANSITIONED", entityType: "dossier", entityId: input.id, beforeData: current[0], afterData: input });
      await notificationService.notify({ userId: ctx.user.id, type: "DOSSIER_UPDATED", title: "Dossier mis à jour", body: `${current[0].reference} est maintenant ${input.status}.`, entityType: "dossier", entityId: input.id });
      return { success: true };
    }),
  }),
  offices: permissionGuard(["sous_proved", "secretariat", "chef_bureau", "ops"]).query(async () => { const db = await getDb(); return db ? db.select().from(offices).where(eq(offices.isActive, true)).orderBy(offices.name) : []; }),
  notifications: router({
    unread: protectedProcedure.query(({ ctx }) => unreadNotifications(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id))); return { success: true }; }),
  }),
});

export type AppRouter = typeof appRouter;
