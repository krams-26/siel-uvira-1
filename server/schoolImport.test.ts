import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type ImportedSchool = {
  code: string;
  officialName: string;
  level: string;
  studentCount: number;
  femaleStudentCount: number;
  teacherCount: number;
};

describe("school import pilot", () => {
  it("selects 30 real schools with numeric SECOPE codes and consistent aggregate fields", () => {
    const data = JSON.parse(readFileSync("/home/ubuntu/siel-uvira-1/tmp/import-schools.json", "utf8")) as { selected: ImportedSchool[] };
    expect(data.selected).toHaveLength(30);
    data.selected.forEach(school => {
      expect(school.code).toMatch(/^\d{6,8}$/);
      expect(school.officialName.length).toBeGreaterThan(1);
      expect(school.level).toBe("secondaire");
      expect(school.studentCount).toBeGreaterThanOrEqual(school.femaleStudentCount);
      expect(school.teacherCount).toBeGreaterThanOrEqual(0);
    });
  });
});
