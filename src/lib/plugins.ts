import React from "react";

export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.LazyExoticComponent<React.ComponentType>;
  enabled: boolean;
}

export const pluginRegistry: Plugin[] = [
  {
    id: "tts",
    name: "文字转语音",
    description: "输入文字，一键生成语音",
    icon: "\uD83D\uDD0A",
    component: React.lazy(() => import("@/components/tools/TtsTool")),
    enabled: true,
  },
  {
    id: "chat",
    name: "数字分身",
    description: "和我的 AI 分身聊天，了解我的一切",
    icon: "\uD83E\uDD16",
    component: React.lazy(() => import("@/components/tools/ChatTool")),
    enabled: true,
  },
];

export function getEnabledPlugins(): Plugin[] {
  return pluginRegistry.filter((p) => p.enabled);
}
