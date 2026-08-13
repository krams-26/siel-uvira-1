import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = (role: "ops" | "secretariat"): TrpcContext => ({
  user: { id: 8, openId: `workflow-${role}`, name: "Test", email: "test@example.com", loginMethod: "test", role, isActive: true, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("SIEL workflow and documents", () => {
  it("replaces double-brace variables in a document template", async () => {
    const result = await appRouter.createCaller(ctx("ops")).templates.preview({ body: "Réf. {{reference}} — {{nom}}", variables: { reference: "S-DIV/UVR/0001/2026", nom: "Agent Exemple" } });
    expect(result.rendered).toContain("S-DIV/UVR/0001/2026");
    expect(result.rendered).toContain("Agent Exemple");
  });

  it("does not expose template content to an unauthorized regular user", async () => {
    const unauthorized = { ...ctx("secretariat"), user: { ...ctx("secretariat").user!, role: "user" as const } };
    await expect(appRouter.createCaller(unauthorized).templates.preview({ body: "{{x}}", variables: { x: "y" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
