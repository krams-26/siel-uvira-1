import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { schools, users } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("rattachement de comptes écoles", () => {
  it("refuse d’attacher un compte OPS à un établissement", async () => {
    const db = await getDb();
    if (!db) throw new Error("Base de données indisponible pour le test de rattachement");
    const [administrator] = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
    const [opsUser] = await db.select().from(users).where(eq(users.openId, "demo-ops")).limit(1);
    const [demoSchool] = await db.select().from(schools).where(eq(schools.code, "DEMO-SEC-001")).limit(1);
    if (!administrator || !opsUser || !demoSchool) throw new Error("Préconditions DEMO manquantes");
    const caller = appRouter.createCaller({ user: administrator, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });
    await expect(caller.administration.linkSchoolAccount({ userId: opsUser.id, schoolId: demoSchool.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const [unchangedOps] = await db.select().from(users).where(and(eq(users.id, opsUser.id), eq(users.role, "ops"))).limit(1);
    expect(unchangedOps?.schoolId).toBeNull();
  });
});
