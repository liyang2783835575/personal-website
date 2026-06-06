<!-- github conflict line -->

赛博朋克风格个人网站，基于 Next.js 16，集成 3D 粒子背景、Framer Motion 动画、AI 数字分身聊天、多 Provider TTS 语音合成。

## Tech Stack

| 层级 | 技术 |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack, Edge Runtime) |
| UI | React 19 + Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| AI Chat | MiMo + MiniMax 双 Provider (Edge Runtime, Streaming) |
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
#    - MIMO_API_KEY       → MiMo TTS + AI 聊天
#    - MINIMAX_API_KEY    → MiniMax TTS + AI 聊天

# 4. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MIMO_API_KEY` | 推荐 | MiMo API key，用于 AI 数字分身聊天 + TTS 语音合成 |
| `MINIMAX_API_KEY` | 推荐 | MiniMax API key，用于 AI 数字分身聊天 + TTS 语音合成 |
| `NEXT_PUBLIC_SITE_URL` | 否 | 生产环境 URL，用于 OG 图片（默认 `https://liyang.dev`） |

缺失对应 Key 时，相关功能不可用但不影响页面渲染——AI 聊天显示未配置提示，TTS 返回 503。

## Features

- **Hero** — 3D 粒子场 + 打字机标题 + CTA
- **About / Skills / Experience / Projects / Contact** — 滚动驱动动画 section
- **Tools** — 插件系统，含 TTS 和 AI 聊天两个工具
- **TTS 语音合成** — 双 Provider (MiMo / MiniMax)，音色设计、音色复刻、导演模式、40+ 风格标签多选、自定义标签、可折叠高级设置
- **AI 数字分身** — MiMo/MiniMax 流式聊天，多模型可选，以 Li Yang 身份对话
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
│       ├── chat/route.ts       # AI 数字分身 (Edge Runtime, 多 Provider 路由)
│       └── tts/route.ts        # TTS 语音合成 (多 Provider 路由)
├── components/
│   ├── layout/    — Navbar, Footer
│   ├── sections/  — Hero, About, Skills, Experience, Projects, Tools, Contact
│   ├── effects/   — GlitchText, ParticleField
│   ├── tools/     — TtsTool, ChatTool
│   └── ui/        — ScrollProgress
├── hooks/          — useReducedMotion, useActiveSection
├── lib/
│   ├── chat-providers/ — AI 聊天 Provider 抽象层 (types, mimo, minimax, index)
│   ├── tts-providers/  — TTS Provider 抽象层 (types, mimo, minimax, index)
│   ├── tts-tags.ts     — TTS 风格/音频标签配置
│   ├── tts-db.ts       — IndexedDB 持久化
│   ├── plugins.ts      — 插件注册表
│   └── utils.ts        — cn() 工具函数
└── data/
    └── resume.ts       — 单一数据源
```

## Testing

192 个测试，16 个测试文件，覆盖：

- Hooks: `useReducedMotion`, `useActiveSection`
- Components: `GlitchText`, `Skills`, `Contact`, `ScrollProgress`, `TtsTool`
- Data: `resume` 完整性校验
- Lib: `plugins`, `tts-tags`
- TTS Providers: `mimo`, `minimax` 单元测试
- Chat Providers: `registry` 单元测试
- API Routes: `/api/tts` 集成测试 (Zod 校验、CORS、Provider 路由、错误隔离)
- API Routes: `/api/chat` 集成测试 (多 Provider、请求校验、错误响应)

```bash
npm run test:run       # 运行全部测试
npm run test:coverage  # 覆盖率报告
```

## Deployment

本项目使用 **Vercel** 部署（Next.js 原生支持，零配置）。

### 前置条件

- Node.js **≥ 20.9**（Next.js 16 要求，参见 `.nvmrc`）
- Git
- GitHub / GitLab 账号
- Vercel 账号（[免费注册](https://vercel.com/signup)）

### 方式一：Vercel Git Integration（推荐，push 自动部署）

#### 1. 推送代码到 Git 仓库

```bash
git init                       # 如果还没初始化
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>   # 例如 GitHub repo
git push -u origin master
```

#### 2. 在 Vercel 导入项目

1. 打开 https://vercel.com/new
2. **Import Git Repository** → 选择你的仓库 → **Import**
3. Framework Preset 自动识别为 **Next.js**，无需修改
4. **先不点 Deploy**，先配环境变量

#### 3. 配置环境变量

在 **Environment Variables** 区域添加：

| Name | Value | Environment |
|------|-------|-------------|
| `MIMO_API_KEY` | `tp-...` | Production, Preview |
| `MINIMAX_API_KEY` | `sk-cp-...` | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | Production only |

> Key 来源：本地 `.env.local` 文件，或对应平台的 API 控制台。
> 缺失任何 Key 不影响构建，对应功能降级（AI 聊天显示未配置提示，TTS 返回 503）。

#### 4. 部署

点 **Deploy**。首次构建约 2-3 分钟。成功后获得预览域名 `*.vercel.app`。

之后每次 `git push` 自动触发部署；PR 自动获得 Preview URL。

#### 5. 绑定自定义域名（可选）

1. Vercel Dashboard → 项目 → **Settings** → **Domains**
2. 输入域名 → 按提示配置 DNS（Vercel 会自动校验）
3. Vercel 自动签发 Let's Encrypt SSL 证书

### 方式二：Vercel CLI 手动部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 首次登录
vercel login

# 部署（首次会引导你创建项目并关联 Git）
vercel

# 部署到生产
vercel --prod

# 环境变量（也可在 Dashboard 配置）
vercel env add MIMO_API_KEY production
vercel env add MINIMAX_API_KEY production
```

### 本地构建验证

部署前先在本地确认构建和测试通过：

```bash
npm install
npm run build        # 生产构建
npm run test:run     # 全部测试
npm run start        # 本地预览生产版本 (http://localhost:3000)
```

### 部署后检查清单

- [ ] 首页正常加载，3D 粒子背景显示
- [ ] 所有 section 滚动动画正常
- [ ] 项目模块：Featured 卡片展开/折叠正常
- [ ] 项目模块：运营中心/产品中心展开详情正常
- [ ] TTS 语音合成可用（需要 MIMO/MiniMax Key）
- [ ] AI 数字分身聊天可用（需要 MIMO/MiniMax Key）
- [ ] 浏览器控制台无 CSP 错误
- [ ] 移动端响应式布局正常
