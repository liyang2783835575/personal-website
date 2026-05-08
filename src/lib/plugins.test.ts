import { describe, it, expect } from "vitest";
import { pluginRegistry, getEnabledPlugins } from "./plugins";

describe("pluginRegistry", () => {
  it("has entries", () => {
    expect(pluginRegistry.length).toBeGreaterThan(0);
  });

  it("each plugin has required fields", () => {
    for (const plugin of pluginRegistry) {
      expect(plugin.id).toBeTruthy();
      expect(typeof plugin.id).toBe("string");

      expect(plugin.name).toBeTruthy();
      expect(typeof plugin.name).toBe("string");

      expect(plugin.description).toBeTruthy();
      expect(typeof plugin.description).toBe("string");

      expect(plugin.icon).toBeTruthy();
      expect(typeof plugin.icon).toBe("string");

      expect(plugin.component).toBeDefined();

      expect(typeof plugin.enabled).toBe("boolean");
    }
  });

  it("has a TTS plugin that is enabled", () => {
    const tts = pluginRegistry.find((p) => p.id === "tts");
    expect(tts).toBeDefined();
    expect(tts!.enabled).toBe(true);
    expect(tts!.name).toBe("文字转语音");
  });

  it("has a Chat plugin that is enabled", () => {
    const chat = pluginRegistry.find((p) => p.id === "chat");
    expect(chat).toBeDefined();
    expect(chat!.enabled).toBe(true);
    expect(chat!.name).toBe("数字分身");
  });

  it("has unique plugin ids", () => {
    const ids = pluginRegistry.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("getEnabledPlugins", () => {
  it("returns only enabled plugins", () => {
    const enabled = getEnabledPlugins();
    for (const plugin of enabled) {
      expect(plugin.enabled).toBe(true);
    }
  });

  it("returns all plugins when all are enabled", () => {
    const enabled = getEnabledPlugins();
    const allEnabled = pluginRegistry.every((p) => p.enabled);
    if (allEnabled) {
      expect(enabled.length).toBe(pluginRegistry.length);
    }
  });
});
