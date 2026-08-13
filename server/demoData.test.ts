import { describe, expect, it } from "vitest";
import { demoDossier, demoNotification, demoSchools } from "./demoData";

describe("demo data", () => {
  it("contains only explicitly labelled non-sensitive examples", () => {
    expect(demoSchools.every(school => school.code.startsWith("DEMO-"))).toBe(true);
    expect(demoDossier.reference.startsWith("DEMO/")).toBe(true);
    expect(demoNotification.type).toBe("DEMO_WORKFLOW");
  });
});
