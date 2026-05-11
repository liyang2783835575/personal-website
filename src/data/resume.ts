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
    featured?: boolean;
    category?: "enterprise" | "personal";
    highlights?: { title: string; detail: string }[];
    metrics?: string[];
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
      name: "征信产品核心服务",
      description:
        "企业级产品编排引擎，支撑全量业务线。基于 Spring Boot WebFlux 的全异步架构，日处理千万级请求，通过 DAG 六阶段流水线与可配置规则引擎实现产品的动态组装与分发。",
      tech: [
        "Java",
        "Spring Boot WebFlux",
        "Maven",
        "Nacos",
        "Redis/R2M",
        "FMQ",
        "JSF",
        "KMS",
        "Groovy",
        "Guava DAG",
        "Caffeine",
      ],
      featured: true,
      category: "enterprise",
      highlights: [
        {
          title: "双引擎流水线架构",
          detail:
            "兼容旧版责任链模式，同时演进至基于 Google Guava DAG 的六阶段编排引擎，支持产品依赖图的拓扑排序与同层级并发执行，日处理千万级请求。",
        },
        {
          title: "全链路响应式架构",
          detail:
            "基于 CompletableFuture 的非阻塞异步编程模型，从 KMS 加密到远程调用的全链路异步化，消除 Netty IO 线程阻塞瓶颈。",
        },
        {
          title: "产品依赖图引擎",
          detail:
            "构建产品 DAG 依赖图，执行拓扑排序（逆向叶子剥离），同深度产品 CompletableFuture 并发编排，支持硬/软依赖、循环检测与深度限制。",
        },
        {
          title: "Groovy 沙箱规则引擎",
          detail:
            "沙箱化 Groovy 脚本执行环境，Import 白名单 + Token 黑名单（goto 等）+ 1 秒超时中断，支持 4 种响应码规则与自定义引用类型，使客户可自定义产品组装逻辑。",
        },
        {
          title: "多层容错与降级",
          detail:
            "FMQ 消息队列磁盘溢出兜底、带随机抖动的缓存版本刷新防惊群效应、KMS 异步加密非关键路径解耦、敏感日志字段脱敏。",
        },
        {
          title: "壳产品匹配算法",
          detail:
            "三趟匹配算法：逆向数据源签名匹配 → 正向匹配 → 精确保留，支持新旧两种壳产品模式，含超量检测与阻断能力。",
        },
      ],
      metrics: [
        "日均请求 10M+",
        "423 Java 源文件",
        "10 个 Controller",
        "7 套环境 Profile",
        "17+ 缓存实体",
      ],
    },
    {
      name: "星空议会",
      description: "AI 驱动的塔罗占卜 Web 应用，支持每日抽牌、历史记录、AI 解读",
      tech: ["Vanilla JS", "Tailwind CSS", "Cloudflare Workers", "D1", "Claude API"],
      link: "https://github.com/liyang/starry-council",
      category: "personal",
    },
    {
      name: "打工虾逃游记",
      description: "抖音小游戏，可爱画风的跑酷类游戏",
      tech: ["Cocos Creator", "TypeScript", "抖音小游戏 SDK"],
      category: "personal",
    },
    {
      name: "个人网站",
      description: "赛博朋克风格的个人主页，集成 AI 工具集",
      tech: ["Next.js", "React", "Three.js", "Tailwind CSS"],
      category: "personal",
    },
  ],
};
