import { describe, it, expect } from "vitest";
import { resume } from "./resume";

describe("resume data", () => {
  it("has a non-empty name", () => {
    expect(resume.name).toBeTruthy();
    expect(typeof resume.name).toBe("string");
    expect(resume.name.length).toBeGreaterThan(0);
  });

  it("has a non-empty title", () => {
    expect(resume.title).toBeTruthy();
    expect(typeof resume.title).toBe("string");
    expect(resume.title.length).toBeGreaterThan(0);
  });

  it("has a non-empty bio", () => {
    expect(resume.bio).toBeTruthy();
    expect(typeof resume.bio).toBe("string");
    expect(resume.bio.length).toBeGreaterThan(0);
  });

  it("has a non-empty avatar path", () => {
    expect(resume.avatar).toBeTruthy();
    expect(typeof resume.avatar).toBe("string");
    expect(resume.avatar.length).toBeGreaterThan(0);
  });

  it("has at least one contact method", () => {
    const contactValues = Object.values(resume.contacts).filter(Boolean);
    expect(contactValues.length).toBeGreaterThan(0);
  });

  it("has a skills array with items", () => {
    expect(Array.isArray(resume.skills)).toBe(true);
    expect(resume.skills.length).toBeGreaterThan(0);
  });

  it("each skill has a non-empty name", () => {
    for (const skill of resume.skills) {
      expect(skill.name).toBeTruthy();
      expect(typeof skill.name).toBe("string");
      expect(skill.name.length).toBeGreaterThan(0);
    }
  });

  it("each skill has a level between 0 and 100", () => {
    for (const skill of resume.skills) {
      expect(typeof skill.level).toBe("number");
      expect(skill.level).toBeGreaterThanOrEqual(0);
      expect(skill.level).toBeLessThanOrEqual(100);
    }
  });

  it("each skill has a valid category", () => {
    const validCategories = ["frontend", "backend", "tool", "other"];
    for (const skill of resume.skills) {
      expect(validCategories).toContain(skill.category);
    }
  });

  it("has an experience array with items", () => {
    expect(Array.isArray(resume.experience)).toBe(true);
    expect(resume.experience.length).toBeGreaterThan(0);
  });

  it("each experience entry has required fields", () => {
    for (const exp of resume.experience) {
      expect(exp.company).toBeTruthy();
      expect(exp.role).toBeTruthy();
      expect(exp.period).toBeTruthy();
      expect(exp.description).toBeTruthy();
    }
  });

  it("has a projects array with items", () => {
    expect(Array.isArray(resume.projects)).toBe(true);
    expect(resume.projects.length).toBeGreaterThan(0);
  });

  it("each project has required fields", () => {
    for (const project of resume.projects) {
      expect(project.name).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(Array.isArray(project.tech)).toBe(true);
      expect(project.tech.length).toBeGreaterThan(0);
    }
  });
});
