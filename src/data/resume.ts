export interface ResumeData {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  contacts: {
    github?: string;
    email?: string;
    linkedin?: string;
    wechat?: string;
  };
  skills: {
    name: string;
    level: number;
    category: "frontend" | "backend" | "tool" | "other";
  }[];
  experience: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  projects: {
    name: string;
    description: string;
    tech: string[];
    link?: string;
    image?: string;
  }[];
}

export const resume: ResumeData = {
  name: "Li Yang",
  title: "Developer & Creator",
  bio: "热爱技术与创造的开发者。喜欢用代码构建有趣的东西，从前端到后端，从 Web 应用到小游戏，探索技术的边界。目前专注于 AI 应用开发和全栈工程。",
  avatar: "/avatar.png",
  contacts: {
    github: "https://github.com/liyang",
    email: "liyang@example.com",
    wechat: "liyang_dev",
  },
  skills: [
    { name: "TypeScript", level: 90, category: "frontend" },
    { name: "React / Next.js", level: 85, category: "frontend" },
    { name: "HTML / CSS", level: 90, category: "frontend" },
    { name: "Tailwind CSS", level: 85, category: "frontend" },
    { name: "Node.js", level: 80, category: "backend" },
    { name: "Python", level: 75, category: "backend" },
    { name: "Cloudflare Workers", level: 80, category: "backend" },
    { name: "SQL / SQLite", level: 70, category: "backend" },
    { name: "Git", level: 85, category: "tool" },
    { name: "Docker", level: 65, category: "tool" },
    { name: "Cocos Creator", level: 70, category: "other" },
    { name: "AI / LLM 应用", level: 80, category: "other" },
  ],
  experience: [
    {
      company: "独立开发者",
      role: "全栈开发",
      period: "2024 - 至今",
      description:
        "独立开发多个 Web 应用和小游戏项目，涵盖 AI 应用、前端工程、云端部署等领域。",
    },
    {
      company: "星空议会",
      role: "全栈开发 & 产品设计",
      period: "2024",
      description:
        "AI 塔罗占卜应用，前端 Vanilla JS + Tailwind，后端 Cloudflare Workers + D1，集成 Claude API 实现智能解读。",
    },
    {
      company: "打工虾逃游记",
      role: "游戏开发",
      period: "2024",
      description:
        "抖音小游戏，使用 Cocos Creator 3.8.8 开发，包含物理碰撞、距离追踪、障碍物生成等核心系统。",
    },
  ],
  projects: [
    {
      name: "星空议会",
      description: "AI 驱动的塔罗占卜 Web 应用，支持每日抽牌、历史记录、AI 解读",
      tech: ["Vanilla JS", "Tailwind CSS", "Cloudflare Workers", "D1", "Claude API"],
      link: "https://github.com/liyang/starry-council",
    },
    {
      name: "打工虾逃游记",
      description: "抖音小游戏，可爱画风的跑酷类游戏",
      tech: ["Cocos Creator", "TypeScript", "抖音小游戏 SDK"],
    },
    {
      name: "个人网站",
      description: "赛博朋克风格的个人主页，集成 AI 工具集",
      tech: ["Next.js", "React", "Three.js", "Tailwind CSS"],
    },
  ],
};
