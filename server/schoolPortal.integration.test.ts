import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { schools, users } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

async function schoolContext(code: string): Promise<TrpcContext> {
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible pour le test d’intégration");
  const school = await db.select().from(schools).where(eq(schools.code, code)).limit(1);
  if (!school[0]) throw new Error(`École importée absente : ${code}`);
  const account = await db.select().from(users).where(and(eq(users.schoolId, school[0].id), eq(users.role, "ecole"))).limit(1);
  if (!account[0]) throw new Error(`Précompte portail absent : ${code}`);
  return {
    user: account[0],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("portail école importé", () => {
  it("isole les fiches de deux établissements importés", async () => {
    const firstCaller = appRouter.createCaller(await schoolContext("6081276"));
    const secondCaller = appRouter.createCaller(await schoolContext("6005333"));
    const [first, second] = await Promise.all([firstCaller.portal.profile(), secondCaller.portal.profile()]);
    expect(first?.school?.code).toBe("6081276");
    expect(second?.school?.code).toBe("6005333");
    expect(first?.school?.id).not.toBe(second?.school?.id);
    expect(first?.statistics.some(stat => stat.status === "imported")).toBe(true);
    await expect(firstCaller.reports.submit({
      schoolId: second!.school!.id,
      reportType: "palmares",
      period: "2025-2026",
      fileName: "palmares.pdf",
      mimeType: "application/pdf",
      base64: "dGVzdA==dGVzdA==",
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
