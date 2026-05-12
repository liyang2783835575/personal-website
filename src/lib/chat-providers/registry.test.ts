import { describe, it, expect } from "vitest";
import { getChatProvider, listChatProviders } from "./index";

describe("chat provider registry", () => {
  it("lists all providers", () => {
    const providers = listChatProviders();
    expect(providers.length).toBe(2);
  });

  it("each provider has required fields", () => {
    for (const p of listChatProviders()) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.icon).toBeTruthy();
      expect(p.models.length).toBeGreaterThan(0);
      expect(p.defaultModel).toBeTruthy();
      expect(typeof p.stream).toBe("function");
    }
  });

  it("getChatProvider returns provider by id", () => {
    expect(getChatProvider("mimo")).toBeDefined();
    expect(getChatProvider("minimax")).toBeDefined();
  });

  it("getChatProvider returns undefined for unknown id", () => {
    expect(getChatProvider("unknown")).toBeUndefined();
  });

  it("each provider has unique id", () => {
    const ids = listChatProviders().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("defaultModel exists in models list", () => {
    for (const p of listChatProviders()) {
      const modelIds = p.models.map((m) => m.id);
      expect(modelIds).toContain(p.defaultModel);
    }
  });
});
