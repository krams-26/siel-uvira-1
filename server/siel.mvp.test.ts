import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "admin" | "sous_proved" | "secretariat" | "chef_bureau" | "ops" | "inspecteur" | "ecole"): TrpcContext {
  return {
    user: { id: 7, openId: `test-${role}`, name: "Agent de test", email: "test@example.com", loginMethod: "test", role, isActive: true, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("SIEL Uvira 1 MVP access control", () => {
  it("allows an operational role to read the dashboard", async () => {
    const result = await appRouter.createCaller(contextFor("secretariat")).dashboard();
    expect(result).toHaveProperty("dossiers");
    expect(result).toHaveProperty("urgent");
  });

  it("rejects a regular user from the institutional dashboard", async () => {
    await expect(appRouter.createCaller(contextFor("user")).dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows admin to access the dashboard guard", async () => {
    const result = await appRouter.createCaller(contextFor("admin")).dashboard();
    expect(result).toHaveProperty("schools");
  });
});
