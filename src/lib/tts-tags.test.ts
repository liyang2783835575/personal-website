import { describe, it, expect } from "vitest";
import {
  STYLE_CATEGORIES,
  AUDIO_TAGS,
  filterTagsByProvider,
  formatStylePrefix,
} from "./tts-tags";

describe("STYLE_CATEGORIES", () => {
  it("has 6 categories", () => {
    expect(STYLE_CATEGORIES).toHaveLength(6);
  });

  it("each category has a label and tags", () => {
    for (const cat of STYLE_CATEGORIES) {
      expect(cat.label).toBeTruthy();
      expect(cat.tags.length).toBeGreaterThan(0);
    }
  });

  it("emotion category has 12 tags", () => {
    const cat = STYLE_CATEGORIES.find((c) => c.label === "情绪");
    expect(cat?.tags).toHaveLength(12);
  });
});

describe("AUDIO_TAGS", () => {
  it("has at least 10 tags", () => {
    expect(AUDIO_TAGS.length).toBeGreaterThanOrEqual(10);
  });

  it("all tags use [tag] format", () => {
    for (const t of AUDIO_TAGS) {
      expect(t.tag).toMatch(/^\[.*\]$/);
    }
  });
});

describe("filterTagsByProvider", () => {
  const tags = [
    { label: "通用", tag: "通用" },
    { label: "MiMo专属", tag: "mimo_only", provider: "mimo" },
    { label: "MiniMax专属", tag: "minimax_only", provider: "minimax" },
  ];

  it("returns all tags when providerId is undefined", () => {
    const result = filterTagsByProvider(tags, undefined);
    expect(result).toHaveLength(3);
  });

  it("returns universal + mimo tags for provider 'mimo'", () => {
    const result = filterTagsByProvider(tags, "mimo");
    expect(result).toHaveLength(2);
    expect(result.find((t) => t.provider === "minimax")).toBeUndefined();
  });

  it("returns universal + minimax tags for provider 'minimax'", () => {
    const result = filterTagsByProvider(tags, "minimax");
    expect(result).toHaveLength(2);
    expect(result.find((t) => t.provider === "mimo")).toBeUndefined();
  });
});

describe("formatStylePrefix", () => {
  it("returns empty string for empty array", () => {
    expect(formatStylePrefix([])).toBe("");
  });

  it("returns single tag with parens", () => {
    expect(formatStylePrefix(["开心"])).toBe("(开心)");
  });

  it("joins multiple tags with space", () => {
    expect(formatStylePrefix(["开心", "温柔"])).toBe("(开心 温柔)");
  });
});
