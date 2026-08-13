import { COOKIE_NAME } from "@shared/const";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auditLogs, documentTemplates, documents, dossierEvents, dossiers, notifications, offices, permissions, reports, rolePermissions, schools, userOfficeAssignments, users } from "../drizzle/schema";
import { createAudit, getDb, listDossiers, listSchools, nextSequence, unreadNotifications } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "./db";
import { notificationService } from "./notificationService";
import { storagePut } from "./storage";

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
    update: permissionGuard(["sous_proved", "secretariat", "admin"], "schools.edit").input(z.object({ id: z.number(), officialName: z.string().min(2).optional(), schoolType: z.string().min(2).optional(), level: z.string().min(2).optional(), directorName: z.string().optional(), territory: z.string().optional(), commune: z.string().optional(), status: z.string().optional(), notes: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const before = await db.select().from(schools).where(eq(schools.id, input.id)).limit(1); if (!before[0]) throw new TRPCError({ code: "NOT_FOUND" });
      const { id, ...changes } = input; await db.update(schools).set(changes).where(eq(schools.id, id)); await createAudit({ actorId: ctx.user.id, action: "SCHOOL_UPDATED", entityType: "school", entityId: id, beforeData: before[0], afterData: changes }); return { success: true };
    }),
  }),
  dossiers: router({
    list: permissionGuard(["sous_proved", "secretariat", "chef_bureau", "ops", "inspecteur"], "dossiers.view").query(() => listDossiers()),
    create: permissionGuard(["sous_proved", "secretariat", "admin"], "courriers.create").input(z.object({ subject: z.string().min(3), sender: z.string().min(2), source: z.string().min(2), description: z.string().optional(), externalReference: z.string().optional(), schoolId: z.number().optional(), priority: z.enum(["normal", "high", "urgent"]).default("normal"), dueAt: z.date().optional(), attachment: z.object({ fileName: z.string(), mimeType: z.string(), base64: z.string().min(10) }).optional() })).mutation(async ({ input, ctx }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const year = new Date().getUTCFullYear();
      const reference = await nextSequence("courrier-entrant", year, "S-DIV/UVR/");
      const { attachment, ...dossierInput } = input;
      const result = await db.insert(dossiers).values({ ...dossierInput, reference, createdBy: ctx.user.id });
      const id = Number(result[0].insertId);
      await db.insert(dossierEvents).values({ dossierId: id, action: "RECEIVED", toStatus: "received", actorId: ctx.user.id, comment: "Dossier enregistré" });
      if (attachment) { const uploaded = await storagePut(`dossiers/${ctx.user.id}/${attachment.fileName}`, Buffer.from(attachment.base64, "base64"), attachment.mimeType); await db.insert(documents).values({ dossierId: id, title: attachment.fileName, documentType: "courrier_joint", fileKey: uploaded.key, fileUrl: uploaded.url, mimeType: attachment.mimeType, fileSize: Buffer.from(attachment.base64, "base64").length, uploadedBy: ctx.user.id }); }
      await createAudit({ actorId: ctx.user.id, action: "DOSSIER_CREATED", entityType: "dossier", entityId: id, afterData: { ...dossierInput, reference } });
      await notificationService.notify({ userId: ctx.user.id, type: input.priority === "urgent" ? "URGENT_DOSSIER_RECEIVED" : "DOSSIER_RECEIVED", title: input.priority === "urgent" ? "Dossier urgent reçu" : "Nouveau dossier reçu", body: `${reference} · ${input.subject}`, entityType: "dossier", entityId: id });
      return { id, reference };
    }),
    history: permissionGuard(["sous_proved", "secretariat", "chef_bureau", "ops", "inspecteur"], "dossiers.view").input(z.object({ id: z.number() })).query(async ({ input }) => { const db = await getDb(); return db ? db.select().from(dossierEvents).where(eq(dossierEvents.dossierId, input.id)).orderBy(desc(dossierEvents.createdAt)) : []; }),
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
  documents: router({
    upload: permissionGuard(["sous_proved", "secretariat", "chef_bureau", "ops"], "documents.create").input(z.object({ title: z.string().min(2), documentType: z.string().min(2), category: z.string().optional(), dossierId: z.number().optional(), schoolId: z.number().optional(), officeId: z.number().optional(), fileName: z.string().min(1), mimeType: z.string().min(2), base64: z.string().min(10) })).mutation(async ({ input, ctx }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const uploaded = await storagePut(`documents/${ctx.user.id}/${input.fileName}`, Buffer.from(input.base64, "base64"), input.mimeType);
      const result = await db.insert(documents).values({ title: input.title, documentType: input.documentType, category: input.category, dossierId: input.dossierId, schoolId: input.schoolId, officeId: input.officeId, fileKey: uploaded.key, fileUrl: uploaded.url, mimeType: input.mimeType, fileSize: Buffer.from(input.base64, "base64").length, uploadedBy: ctx.user.id });
      await createAudit({ actorId: ctx.user.id, action: "DOCUMENT_CREATED", entityType: "document", entityId: Number(result[0].insertId), afterData: { ...input, base64: undefined, fileKey: uploaded.key } });
      return { id: Number(result[0].insertId), ...uploaded };
    }),
  }),
  templates: router({
    create: permissionGuard(["sous_proved", "secretariat", "ops"], "documents.create").input(z.object({ name: z.string().min(2), documentType: z.string().min(2), body: z.string().min(10), variables: z.array(z.string()).default([]) })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const result = await db.insert(documentTemplates).values({ name: input.name, documentType: input.documentType, body: input.body, variables: JSON.stringify(input.variables), createdBy: ctx.user.id }); await createAudit({ actorId: ctx.user.id, action: "TEMPLATE_CREATED", entityType: "documentTemplate", entityId: Number(result[0].insertId), afterData: input }); return { id: Number(result[0].insertId) }; }),
    preview: permissionGuard(["sous_proved", "secretariat", "ops"], "documents.download").input(z.object({ body: z.string(), variables: z.record(z.string(), z.string()) })).query(({ input }) => { let rendered = input.body; for (const [key, value] of Object.entries(input.variables)) rendered = rendered.replaceAll(`{{${key}}}`, value); return { rendered }; }),
    list: permissionGuard(["sous_proved", "secretariat", "ops"], "documents.download").query(async () => { const db = await getDb(); return db ? db.select().from(documentTemplates).where(eq(documentTemplates.isActive, true)).orderBy(desc(documentTemplates.updatedAt)) : []; }),
  }),
  reports: router({
    list: permissionGuard(["sous_proved", "secretariat", "inspecteur"], "reports.view").query(async () => { const db = await getDb(); return db ? db.select().from(reports).orderBy(desc(reports.submittedAt)) : []; }),
    submit: permissionGuard(["sous_proved", "secretariat", "inspecteur", "ecole"], "reports.create").input(z.object({ schoolId: z.number(), reportType: z.string().min(2), period: z.string().min(2), fileName: z.string().min(1), mimeType: z.string().min(2), base64: z.string().min(10) })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const uploaded = await storagePut(`reports/${ctx.user.id}/${input.fileName}`, Buffer.from(input.base64, "base64"), input.mimeType); const result = await db.insert(reports).values({ schoolId: input.schoolId, reportType: input.reportType, period: input.period, fileKey: uploaded.key, fileUrl: uploaded.url, submittedBy: ctx.user.id }); await createAudit({ actorId: ctx.user.id, action: "REPORT_SUBMITTED", entityType: "report", entityId: Number(result[0].insertId), afterData: { ...input, base64: undefined, fileKey: uploaded.key } }); return { id: Number(result[0].insertId), ...uploaded }; }),
  }),
  statistics: permissionGuard(["sous_proved", "secretariat", "inspecteur"], "statistics.view").query(async () => { const db = await getDb(); if (!db) return { schools: 0, students: 0, teachers: 0, dossiers: 0, reports: 0 }; const [schoolRows, dossierRows, reportRows] = await Promise.all([db.select().from(schools), db.select().from(dossiers), db.select().from(reports)]); return { schools: schoolRows.length, students: schoolRows.reduce((sum, s) => sum + s.studentCount, 0), teachers: schoolRows.reduce((sum, s) => sum + s.teacherCount, 0), dossiers: dossierRows.length, reports: reportRows.length }; }),
  administration: router({
    permissions: permissionGuard(["admin", "sous_proved"], "audit.view").query(async () => { const db = await getDb(); return db ? db.select({ permission: permissions, rolePermission: rolePermissions }).from(permissions).leftJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id)) : []; }),
    assignments: permissionGuard(["admin", "sous_proved"], "audit.view").query(async () => { const db = await getDb(); return db ? db.select({ assignment: userOfficeAssignments, user: users, office: offices }).from(userOfficeAssignments).innerJoin(users, eq(userOfficeAssignments.userId, users.id)).innerJoin(offices, eq(userOfficeAssignments.officeId, offices.id)) : []; }),
    assignOffice: permissionGuard(["admin", "sous_proved"], "audit.view").input(z.object({ userId: z.number(), officeId: z.number(), jobTitle: z.string().optional(), employeeNumber: z.string().optional() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); const result = await db.insert(userOfficeAssignments).values(input); await createAudit({ actorId: ctx.user.id, action: "USER_OFFICE_ASSIGNED", entityType: "userOfficeAssignment", entityId: Number(result[0].insertId), afterData: input }); return { id: Number(result[0].insertId) }; }),
  }),
  audit: router({
    list: permissionGuard(["sous_proved"], "audit.view").query(async () => { const db = await getDb(); return db ? db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100) : []; }),
    delete: permissionGuard(["admin"]).input(z.object({ id: z.number() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); await db.delete(auditLogs).where(eq(auditLogs.id, input.id)); return { success: true }; }),
  }),
  notifications: router({
    unread: protectedProcedure.query(({ ctx }) => unreadNotifications(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id))); return { success: true }; }),
  }),
});

export type AppRouter = typeof appRouter;
