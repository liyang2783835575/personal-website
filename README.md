# Li Yang — Personal Website

赛博朋克风格个人网站，基于 Next.js 16，集成 3D 粒子背景、Framer Motion 动画、AI 数字分身聊天、多 Provider TTS 语音合成。

## Tech Stack

| 层级 | 技术 |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack, Edge Runtime) |
| UI | React 19 + Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| AI Chat | Anthropic Claude API (Edge Runtime, Streaming) |
| TTS | MiMo + MiniMax 双 Provider，支持音色设计/复刻/导演模式 |
| Storage | IndexedDB (TTS 历史记录持久化) |
| Validation | Zod |
| Testing | Vitest + @testing-library/react (158 tests, 14 files) |
| Deployment | Vercel |

## Getting Started

```bash
# 1. 安装依赖
npm install

# 2. 创建环境变量文件
cp .env.example .env.local

# 3. 编辑 .env.local，填入 API Key（至少需要一个）
#    - ANTHROPIC_API_KEY  → AI 数字分身聊天
#    - MIMO_API_KEY       → MiMo TTS 语音合成
#    - MINIMAX_API_KEY    → MiniMax TTS 语音合成

# 4. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | 推荐 | Claude API key，用于 AI 数字分身聊天 |
| `MIMO_API_KEY` | 推荐 | MiMo TTS API key，语音合成主 Provider |
| `MINIMAX_API_KEY` | 推荐 | MiniMax TTS API key，语音合成备选 Provider |
| `NEXT_PUBLIC_SITE_URL` | 否 | 生产环境 URL，用于 OG 图片（默认 `https://liyang.dev`） |

缺失对应 Key 时，相关功能不可用但不影响页面渲染——AI 聊天显示未配置提示，TTS 返回 503。

## Features

- **Hero** — 3D 粒子场 + 打字机标题 + CTA
- **About / Skills / Experience / Projects / Contact** — 滚动驱动动画 section
- **Tools** — 插件系统，含 TTS 和 AI 聊天两个工具
- **TTS 语音合成** — 双 Provider (MiMo / MiniMax)，音色设计、音色复刻、导演模式、40+ 风格标签多选、自定义标签、可折叠高级设置
- **AI 数字分身** — Claude 流式聊天，以 Li Yang 身份对话
- **OG Image** — `/opengraph-image` 自动生成社交分享图
- **SEO** — metadata、sitemap、robots.txt、JSON-LD schema
- **Accessibility** — `prefers-reduced-motion` 降级、语义 HTML、ARIA labels、键盘导航

## Scripts

```bash
npm run dev            # 开发服务器 (Turbopack)
npm run build          # 生产构建
npm run start          # 生产服务器
npm run lint           # ESLint
npm run test           # Vitest watch 模式
npm run test:run       # Vitest 单次运行
npm run test:coverage  # Vitest + 覆盖率报告
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # 根布局、字体、SEO 元数据、JSON-LD
│   ├── page.tsx                # 主页面、scroll-snap 容器、键盘导航
│   ├── globals.css             # CSS 变量、动画 keyframes
│   ├── opengraph-image.tsx     # OG 图片生成 (1200×630)
│   ├── robots.ts / sitemap.ts  # SEO
│   └── api/
│       ├── chat/route.ts       # AI 数字分身 (Edge Runtime, Streaming)
│       └── tts/route.ts        # TTS 语音合成 (多 Provider 路由)
├── components/
│   ├── layout/    — Navbar, Footer
│   ├── sections/  — Hero, About, Skills, Experience, Projects, Tools, Contact
│   ├── effects/   — GlitchText, ParticleField
│   ├── tools/     — TtsTool, ChatTool
│   └── ui/        — ScrollProgress
├── hooks/          — useReducedMotion, useActiveSection
├── lib/
│   ├── tts-providers/  — Provider 抽象层 (types, mimo, minimax, index)
│   ├── tts-tags.ts     — TTS 风格/音频标签配置
│   ├── tts-db.ts       — IndexedDB 持久化
│   ├── plugins.ts      — 插件注册表
│   └── utils.ts        — cn() 工具函数
└── data/
    └── resume.ts       — 单一数据源
```

## Testing

158 个测试，14 个测试文件，覆盖：

- Hooks: `useReducedMotion`, `useActiveSection`
- Components: `GlitchText`, `Skills`, `Contact`, `ScrollProgress`, `TtsTool`
- Data: `resume` 完整性校验
- Lib: `plugins`, `tts-tags`
- Providers: `mimo`, `minimax` 单元测试
- API Routes: `/api/tts` 集成测试 (Zod 校验、CORS、Provider 路由、错误隔离)

```bash
npm run test:run       # 运行全部测试
npm run test:coverage  # 覆盖率报告
```

## Deployment

推荐 Vercel。在 Vercel 项目设置中配置所需环境变量。

```bash
npm run build
# 或
vercel
```
