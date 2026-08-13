import { eq, like } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { assignmentCommissions, documents, documentTemplates, dossiers, offices, reports, schools, schoolBulletins, schoolStaff, users } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("jeu de démonstration transversal", () => {
  it("alimente les écoles, dossiers, rapports, communications, commissions et personnel avec des libellés DEMO", async () => {
    const db = await getDb();
    if (!db) throw new Error("Base de données indisponible pour le test DEMO");
    const [demoSchools, demoDossiers, demoReports, demoBulletins, demoCommissions, demoStaff, demoDocuments, demoTemplates, demoOffices] = await Promise.all([
      db.select().from(schools).where(like(schools.code, "DEMO-%")),
      db.select().from(dossiers).where(like(dossiers.reference, "DEMO-%")),
      db.select().from(reports).where(like(reports.observations, "DEMO%")),
      db.select().from(schoolBulletins).where(like(schoolBulletins.reference, "DEMO-%")),
      db.select().from(assignmentCommissions).where(like(assignmentCommissions.reference, "DEMO-%")),
      db.select().from(schoolStaff).where(like(schoolStaff.fullName, "DEMO%")),
      db.select().from(documents).where(like(documents.title, "DEMO%")),
      db.select().from(documentTemplates).where(like(documentTemplates.name, "DEMO%")),
      db.select().from(offices).where(like(offices.code, "DEMO-%")),
    ]);
    expect(demoSchools.length).toBeGreaterThanOrEqual(4);
    expect(demoDossiers.length).toBeGreaterThanOrEqual(2);
    expect(demoReports.map(report => report.reportType)).toEqual(expect.arrayContaining(["palmares", "pv_reunion", "justificatif", "fiche_statistique"]));
    expect(demoBulletins.length).toBeGreaterThanOrEqual(2);
    expect(demoCommissions.length).toBeGreaterThanOrEqual(3);
    expect(demoCommissions.some(commission => commission.status === "archived")).toBe(true);
    expect(demoStaff.length).toBeGreaterThanOrEqual(3);
    expect(demoDocuments.map(document => document.documentType)).toEqual(expect.arrayContaining(["circulaire", "pv_disciplinaire", "pv_ouverture"]));
    expect(demoTemplates).toHaveLength(1);
    expect(demoOffices.length).toBeGreaterThanOrEqual(4);
    expect(demoSchools.every(school => school.legalStatus === "DEMO")).toBe(true);
  });

  it("alimente le portail DEMO Horizon sans exposer les données des écoles réelles", async () => {
    const db = await getDb();
    if (!db) throw new Error("Base de données indisponible pour le portail DEMO");
    const account = await db.select().from(users).where(eq(users.openId, "demo-school-horizon")).limit(1);
    if (!account[0]) throw new Error("Compte DEMO Horizon absent");
    const caller = appRouter.createCaller({ user: account[0], req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });
    const profile = await caller.portal.profile();
    expect(profile?.school?.code).toBe("DEMO-SEC-001");
    expect(profile?.staff.length).toBeGreaterThanOrEqual(2);
    expect(profile?.reports.map(report => report.reportType)).toEqual(expect.arrayContaining(["palmares", "fiche_statistique"]));
    expect(profile?.bulletins.length).toBeGreaterThanOrEqual(2);
    expect(profile?.school?.code.startsWith("DEMO-")).toBe(true);
    expect(profile?.reports.every(report => report.schoolId === profile.school?.id)).toBe(true);
    expect(profile?.bulletins.every(item => item.recipient.schoolId === profile.school?.id)).toBe(true);
  });

  it("expose la fiche statistique DEMO et son statut de revue dans la liste Sous-PROVED", async () => {
    const db = await getDb();
    if (!db) throw new Error("Base de données indisponible pour la revue DEMO");
    const reviewer = await db.select().from(users).where(eq(users.openId, "demo-sous-proved")).limit(1);
    if (!reviewer[0]) throw new Error("Compte Sous-PROVED DEMO absent");
    const caller = appRouter.createCaller({ user: reviewer[0], req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });
    const reportsList = await caller.reports.list();
    expect(reportsList.some(report => report.reportType === "fiche_statistique" && report.status === "accepted")).toBe(true);
    const commissionsList = await caller.commissions.list();
    expect(commissionsList.some(({ commission }) => commission.reference === "DEMO-CA-2026-003" && commission.status === "archived")).toBe(true);
  });
});
