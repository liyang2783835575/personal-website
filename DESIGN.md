# 个人网站 — 技术设计文档

> 本文档描述 Li Yang 个人网站（https://liyang.dev）的完整设计。涵盖功能架构、技术选型、页面结构、API 设计、安全方案、部署流程。

---

## 1. 项目概述

### 1.1 目标

赛博朋克风格个人简历展示网站，集成 AI 工具集（TTS + 数字分身聊天），展示技术能力、项目经历、技能图谱，支持访客交互。

### 1.2 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.2.6 |
| UI 库 | React | 19.2.4 |
| 样式 | Tailwind CSS v4 | — |
| 动画 | Framer Motion | 12.38.0 |
| 3D 背景 | Three.js + @react-three/fiber + @react-three/drei | — |
| AI 对话 | @anthropic-ai/sdk (Claude API) | — |
| 输入校验 | Zod | — |
| 工具函数 | clsx + tailwind-merge | — |
| 测试 | Vitest + @testing-library/react | — |
| 部署 | Vercel (Edge Runtime) | — |

### 1.3 约束条件

- **预算**：零成本优先，API 调用使用已有的 Claude 账户
- **性能**：Lighthouse Performance ≥ 90，CLS < 0.1
- **可访问性**：WCAG 2.1 AA，支持 `prefers-reduced-motion`
- **浏览器支持**：Chrome 90+、Firefox 90+、Safari 14+、Edge 90+

---

## 2. 页面结构与滚动设计

### 2.1 Section 架构

页面由 7 个全屏 section 组成，采用 **CSS scroll-snap** 实现整页滚动：

```
┌──────────────────────────────────────────────────────┐
│  Navbar (fixed, 毛玻璃, 霓虹边框, 活跃状态高亮)      │
├──────────────────────────────────────────────────────┤
│  Hero    — 3D 粒子场背景 + 打字机标题 + CTA          │
├──────────────────────────────────────────────────────┤
│  About   — 头像 + 个人简介                           │
├──────────────────────────────────────────────────────┤
│  Skills  — 分类技能进度条                            │
├──────────────────────────────────────────────────────┤
│  Experience — 时间线（左右交替布局）                  │
├──────────────────────────────────────────────────────┤
│  Projects — 卡片网格（移动端横向滚动）               │
├──────────────────────────────────────────────────────┤
│  Tools   — 插件入口卡片                              │
├──────────────────────────────────────────────────────┤
│  Contact — 社交链接 + CTA                            │
├──────────────────────────────────────────────────────┤
│  Footer  — 版权 + 技术栈标注                         │
└──────────────────────────────────────────────────────┘
         │
         ▼ 右侧固定
┌────┐
│ ● 首页  │  ← ScrollProgress 进度指示器
│ ○ 关于  │
│ ○ 技能  │
│ ○ 经历  │
│ ○ 项目  │
│ ○ 工具  │
│ ○ 联系  │
└────┘
```

### 2.2 CSS Scroll-Snap 配置

```css
/* globals.css */
.snap-container {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: thin;
  scrollbar-color: var(--neon-cyan) var(--bg-secondary);
}

.snap-section {
  min-height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
}
```

- `mandatory`：每次滚动必定锁定到 section 边界
- `scroll-snap-stop: always`：防止快速滑动跳过 section
- `min-height: 100vh`：每个 section 至少占满一屏

### 2.3 内容溢出处理

- **Experience**：时间线容器使用 `overflow-y: auto` + `max-height: calc(100vh - 8rem)`，允许内容在 section 内滚动
- **Projects**：移动端使用 `overflow-x: auto` + `flex-nowrap` 实现横向滚动，桌面端恢复正常 grid 布局

### 2.4 键盘导航

监听 `keydown` 事件，支持：

| 按键 | 行为 |
|------|------|
| PageDown / ↓ | 跳转下一个 section |
| PageUp / ↑ | 跳转上一个 section |
| Home | 跳转首页 |
| End | 跳转末页 |

排除条件：焦点在 `INPUT`、`TEXTAREA`、`SELECT` 时不响应。

---

## 3. 视觉系统

### 3.1 色彩体系（CSS 变量）

| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--neon-cyan` | `#00fff9` | 主强调色、进度条、发光效果 |
| `--neon-magenta` | `#ff00ff` | 次强调色、标题打字机 |
| `--neon-purple` | `#b026ff` | 第三强调色、标签背景 |
| `--neon-blue` | `#4d7cff` | 辅助色 |
| `--neon-pink` | `#ff6ec7` | 辅助色 |
| `--bg-primary` | `#0a0a0f` | 主背景（深黑偏蓝） |
| `--bg-secondary` | `#0f0f1a` | 次背景 |
| `--bg-card` | `rgba(15,15,25,0.8)` | 卡片背景（半透明） |
| `--text-primary` | `#e0e0ff` | 主文字 |
| `--text-secondary` | `#8888aa` | 次文字 |
| `--text-muted` | `#555577` | 弱化文字 |

### 3.2 Glow 效果

```css
--glow-xs: 0 0 3px var(--neon-cyan);
--glow-sm: 0 0 5px var(--neon-cyan);
--glow-md: 0 0 15px var(--neon-cyan), 0 0 30px rgba(0, 255, 249, 0.3);
--glow-lg: 0 0 20px var(--neon-cyan), 0 0 40px rgba(0, 255, 249, 0.4), 0 0 80px rgba(0, 255, 249, 0.2);
```

### 3.3 扫描线叠加层

全屏半透明扫描线动画，渲染在 `<body>` 最上层：

```css
.scanline-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 249, 0.015) 2px,
    rgba(0, 255, 249, 0.015) 4px
  );
  animation: scanline-scroll 8s linear infinite;
}
```

### 3.4 Section 进入动画

每个 section 进入视口时触发扫描线效果：

```css
.snap-section.section-entering::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 255, 249, 0.06) 50%,
    transparent 100%
  );
  animation: section-scanline 0.6s ease-out forwards;
  z-index: 10;
}
```

### 3.5 Glitch 故障文字效果

通过 CSS `clip-path` + `::before`/`::after` 实现文字故障效果，由 `GlitchText` 组件封装：

```css
.glitch::before {
  color: var(--neon-cyan);
  animation: glitch-shift-1 3s infinite linear alternate-reverse;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}
.glitch::after {
  color: var(--neon-magenta);
  animation: glitch-shift-2 2.5s infinite linear alternate-reverse;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
}
```

### 3.6 霓虹渐变线条

标题下方装饰性动画线条：

```css
.neon-line {
  background: linear-gradient(
    90deg,
    transparent, var(--neon-cyan), var(--neon-magenta),
    var(--neon-cyan), transparent
  );
  background-size: 200% 100%;
  animation: neon-line-shift 3s linear infinite;
}
```

---

## 4. 功能模块详解

### 4.1 Hero Section

- **3D 粒子背景**：`ParticleField` 组件，基于 `@react-three/fiber` + `@react-three/drei`，懒加载（`ssr: false`），粒子数量约 200，随鼠标移动产生交互
- **打字机效果**：`useTypewriter` hook，依次显示 4 个英文 title，交替执行打字→删除→下一词
- **CTA 按钮**：锚链接到 Projects 和 Contact section

### 4.2 Navbar

- 固定定位，初始透明，滚动超过 50px 后切换为毛玻璃效果
- 活跃 section 高亮：通过 `useActiveSection` hook 追踪当前可见 section，对应链接显示 `text-neon-cyan` + 底部霓虹线条
- 移动端：Hamburger 菜单，点击展开垂直菜单（Framer Motion `AnimatePresence`）
- 所有链接点击后调用 `scrollIntoView({ behavior: "smooth" })` 滚动到目标 section

### 4.3 About Section

- 头像区域：圆形容器 + 霓虹边框 + hover 外发光
- 文字区域：双段落简介 + 联系方式标签

### 4.4 Skills Section

- 按 category 分组：前端、后端、工具、其他
- 进度条：Framer Motion 动画填充，`useReducedMotion` 时直接显示目标宽度
- 每条进度条颜色根据 category 映射到不同霓虹色：

```typescript
const categoryBarStyle = {
  frontend: { background: "var(--neon-cyan)", boxShadow: "0 0 8px var(--neon-cyan)" },
  backend: { background: "var(--neon-magenta)", boxShadow: "0 0 8px var(--neon-magenta)" },
  tool: { background: "var(--neon-purple)", boxShadow: "0 0 8px var(--neon-purple)" },
  other: { background: "var(--neon-blue)", boxShadow: "0 0 8px var(--neon-blue)" },
};
```

### 4.5 Experience Section

- 垂直时间线布局，中央线条使用 CSS 渐变
- 卡片左右交替排列（`isLeft = i % 2 === 0`）
- 时间线连接点使用霓虹圆点
- 内容区使用内部滚动（`section-scroll-area`）防止溢出

### 4.6 Projects Section

- 卡片 Tilt 效果：鼠标移入时基于鼠标位置计算 `rotateX`/`rotateY` 产生 3D 倾斜，使用 `card-shine` 实现跟随鼠标的高光
- 桌面端：3 列 grid 布局
- 移动端：横向滚动 + `scroll-snap-type: x mandatory` 锁定卡片
- 项目卡片包含：图标、标题、描述、技术标签、外部链接图标

### 4.7 Tools Section（插件系统）

- 插件注册表在 `src/lib/plugins.ts` 中定义：

```typescript
interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;  // emoji
  component: React.LazyExoticComponent<React.ComponentType>;
  enabled: boolean;
}
```

- 点击插件卡片打开右侧 Drawer（Framer Motion `AnimatePresence` 动画）
- Drawer 内通过 `React.lazy()` 懒加载插件组件
- 关闭：点击 backdrop 或关闭按钮

### 4.8 TtsTool

- 优先使用 **Web Speech API**（`window.speechSynthesis`），零成本
- 降级方案：MiniMax TTS API（需配置 `MINIMAX_API_KEY` 环境变量）
- 功能：语言选择、语速调节、播放/暂停/停止
- 组件卸载时调用 `speechSynthesis.cancel()` 清理

### 4.9 ChatTool（数字分身）

- 使用 `/api/chat` 流式 API，Readablestream 逐帧渲染
- 消息历史保存在 React state，每次发送将历史消息一起发送到 API
- 避免陈旧闭包：使用 `useRef` 保存当前消息列表快照
- 错误处理：部分内容时保留已接收内容并追加错误提示
- 加载状态：3 个跳动的圆点动画

### 4.10 Contact Section

- 邮件链接 + GitHub 链接
- 底部装饰性霓虹渐变线条（缩放动画）

### 4.11 ScrollProgress（右侧导航）

- 固定在视口右侧中央（`right-4 top-1/2 -translate-y-1/2`）
- 每 section 一个圆点 + 标签
- 活跃圆点：`bg-neon-cyan` + `box-shadow` 发光
- 点击跳转：`scrollIntoView({ behavior: "smooth" })`
- 移动端隐藏（`hidden md:flex`）

### 4.12 useActiveSection Hook

- 使用 `IntersectionObserver` 追踪 section 可见性
- `threshold: 0.5`（section 50% 可见时切换活跃状态）
- 返回 `{ activeId: string }`
- 组件卸载时调用 `observer.disconnect()` 清理

---

## 5. API 设计

### 5.1 POST `/api/chat` — 数字分身对话

**请求**
```typescript
{
  messages: {
    role: "user" | "assistant";
    content: string;  // 1-4000 chars
  }[]
}
```

**响应**：Streaming `text/plain`，每帧为纯文本 token

**实现细节**
- Edge Runtime（`export const runtime = 'edge'`）
- Zod 输入校验：`messages` 数组最多 20 条，每条 content 1-4000 字符
- System prompt 注入简历数据（`resume.bio`、`resume.experience`、`resume.skills`）
- 速率限制：内存 Map，10 req/min/IP
- CORS 校验：对比 `Origin` / `Referer` 头部与 `host`
- 所有异常返回通用错误 JSON，HTTP 500
- JSON-LD sanitize：`<` 替换为 `\u003c`

**安全措施**
- CSP 头：`script-src 'self' 'unsafe-inline' 'unsafe-eval'`（Three.js SSR 需要）+ `connect-src 'self' https://api.anthropic.com`
- 输入校验：Zod schema 校验每个 message 的 role + content
- 速率限制：In-memory `Map<string, { count, resetAt }>`
- 错误隔离：所有 try-catch 返回通用错误，不泄漏内部信息

### 5.2 SEO 相关路由

| 路由 | 类型 | 用途 |
|------|------|------|
| `GET /robots.txt` | Static | 允许所有爬虫，指向 sitemap |
| `GET /sitemap.xml` | Static | 所有页面 URL |
| `GET /opengraph-image` | Dynamic | 1200×630 程序化生成 OG 图片 |

---

## 6. 数据结构

### 6.1 resume.ts（单点数据源）

所有页面内容从 `src/data/resume.ts` 读取，修改内容只需修改此文件：

```typescript
export interface ResumeData {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  contacts: { github?: string; email?: string; linkedin?: string; wechat?: string };
  skills: { name: string; level: number; category: "frontend" | "backend" | "tool" | "other" }[];
  experience: { company: string; role: string; period: string; description: string }[];
  projects: { name: string; description: string; tech: string[]; link?: string; image?: string }[];
}
```

### 6.2 useReducedMotion Hook

```typescript
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
```

所有动画组件使用此 hook 作为降级开关。

---

## 7. 动画系统

### 7.1 入场动画（所有 Section）

每个 section 使用 Framer Motion `useInView` + `once: true` + `margin: "-100px"`：

```tsx
const ref = useRef(null);
const inView = useInView(ref, { once: true, margin: "-100px" });
// 动画目标
animate={inView ? { opacity: 1, y: 0 } : {}}
```

`useReducedMotion` 时：Hero 的打字机保持不变，Skills 进度条直接显示最终值，Experience 卡片取消 slide 动画仅 fade in。

### 7.2 Three.js 粒子系统（ParticleField）

- `PointsMaterial` + `BufferGeometry`，约 200 个粒子
- 粒子间连线（`LineSegments`），连线的透明度与粒子间距相关
- 鼠标移动时粒子产生跟随效果（lerp 插值）
- Canvas 使用 `alpha: true` 透明背景，透过下层 CSS 渐变背景
- `AdaptiveDpr` 自动适配设备像素比
- 懒加载：`dynamic(() => import(...), { ssr: false })`

### 7.3 GlitchText 组件

接受 `text`、`as`（渲染标签，默认 span）、`className`。使用 CSS `data-text` 属性和 `::before`/`::after` 实现双轨故障效果。

### 7.4 卡片 3D 倾斜（TiltCard）

- `onMouseMove`：计算鼠标相对卡片中心的偏移量，映射到 `rotateX`/`rotateY`
- `onMouseLeave`：重置 transform
- `.card-shine`：径向渐变高光，跟随鼠标坐标

---

## 8. 安全方案

### 8.1 Content Security Policy（next.config.ts）

```typescript
Content-Security-Policy: default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.anthropic.com;
  frame-src 'none';
  object-src 'none';
```

### 8.2 安全响应头

| 头部 | 值 |
|------|-----|
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |

### 8.3 API 路由安全

- Zod 校验所有输入（角色白名单、content 长度限制）
- 内存速率限制：10 req/min/IP
- Origin/Referer 校验
- 环境变量存储密钥（`ANTHROPIC_API_KEY`）
- `.env.example` 作为模板，`.env` 不提交

---

## 9. 测试覆盖

### 9.1 测试文件

| 文件 | 测试数量 | 覆盖范围 |
|------|---------|---------|
| `useReducedMotion.test.ts` | 5 | hook 逻辑、media query 响应 |
| `resume.test.ts` | 11 | 数据结构完整性、字段类型 |
| `plugins.test.ts` | 6 | 插件注册表过滤逻辑 |
| `GlitchText.test.tsx` | 8 | 组件渲染、emoji 处理、空值 |
| `Skills.test.tsx` | 7 | 进度条渲染、category 样式映射 |
| `Contact.test.tsx` | 7 | 链接渲染、空数据处理 |
| `useActiveSection.test.ts` | 8 | IO 回调、清理、默认值 |
| `ScrollProgress.test.tsx` | 5 | 渲染、活跃状态、点击跳转 |

**总计：60 个测试，100% 通过**

### 9.2 测试工具

- **Vitest**：测试运行器，支持 Vite 快速 HMR
- **@testing-library/react**：`renderHook`、`render`、`screen`、`fireEvent`
- **jsdom**：测试环境

---

## 10. 部署方案

### 10.1 Vercel 部署

1. `vercel.json` 已配置：`{ "framework": "nextjs" }`
2. 环境变量（Vercel Dashboard 设置）：
   - `ANTHROPIC_API_KEY`：Claude API 密钥
   - `NEXT_PUBLIC_SITE_URL`：生产环境 URL（https://liyang.dev）
3. 构建命令：`npm run build`
4. 输出目录：`.next`（Next.js 默认）

### 10.2 Edge Runtime

`/api/chat` 使用 Edge Runtime，获得：
- 全球边缘节点低延迟
- 冷启动 < 50ms
- 免费额度足够个人站

### 10.3 Gitee 仓库

仓库地址：https://gitee.com/lyzwd/personal-website.git

```bash
# 克隆
git clone https://gitee.com/lyzwd/personal-website.git
# 安装依赖
npm install
# 开发
npm run dev
# 构建
npm run build
```

---

## 11. 文件结构

```
personalWebsite/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局：字体、全局样式、SEO 元数据、JSON-LD
│   │   ├── page.tsx            # 主页面：snap-container、useActiveSection、键盘导航
│   │   ├── globals.css         # CSS 变量、snap 样式、动画 keyframes
│   │   ├── opengraph-image.tsx  # OG 图片生成（1200×630）
│   │   ├── robots.ts           # robots.txt
│   │   ├── sitemap.ts          # sitemap.xml
│   │   ├── error.tsx           # 错误边界
│   │   ├── loading.tsx         # 加载状态
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts    # 数字分身流式 API（Edge Runtime）
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx       # 导航栏：活跃高亮、移动端菜单
│   │   │   └── Footer.tsx       # 页脚
│   │   ├── sections/
│   │   │   ├── Hero.tsx         # 粒子场 + 打字机 + CTA
│   │   │   ├── About.tsx        # 头像 + 简介
│   │   │   ├── Skills.tsx       # 分类进度条
│   │   │   ├── Experience.tsx   # 时间线（内部滚动）
│   │   │   ├── Projects.tsx     # 卡片网格（移动端横向滚动）
│   │   │   ├── Tools.tsx        # 插件入口 + Drawer
│   │   │   └── Contact.tsx      # 社交链接
│   │   ├── effects/
│   │   │   ├── GlitchText.tsx   # 故障文字效果
│   │   │   └── ParticleField.tsx # Three.js 粒子系统（懒加载）
│   │   ├── tools/
│   │   │   ├── TtsTool.tsx      # TTS（Web Speech API）
│   │   │   └── ChatTool.tsx     # 数字分身聊天 UI
│   │   └── ui/
│   │       └── ScrollProgress.tsx # 右侧进度指示器
│   ├── hooks/
│   │   ├── useReducedMotion.ts   # prefers-reduced-motion 响应
│   │   └── useActiveSection.ts    # IntersectionObserver 追踪活跃 section
│   ├── lib/
│   │   ├── plugins.ts          # 插件注册表
│   │   └── utils.ts             # cn() 工具函数（clsx + tailwind-merge）
│   └── data/
│       └── resume.ts           # 单一数据源
├── public/
│   └── *.svg                   # 占位图片（Next.js 默认）
├── .env.example                # 环境变量模板
├── next.config.ts              # 安全头配置
├── tailwind.config.ts          # Tailwind v4（@theme inline）
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts
├── package.json
├── package-lock.json
├── vercel.json
└── README.md
```

---

## 12. 环境变量

`.env.example` 模板：

```
ANTHROPIC_API_KEY=         # Claude API 密钥（必填）
NEXT_PUBLIC_SITE_URL=https://liyang.dev  # 生产环境 URL
```

---

## 13. 验证清单

部署前检查：

- [ ] `npm run build` 无错误
- [ ] `npx vitest run` 60/60 测试通过
- [ ] Vercel 环境变量已配置 `ANTHROPIC_API_KEY`
- [ ] Gitee 仓库已创建并推送
- [ ] 浏览器 DevTools Lighthouse Performance ≥ 90
- [ ] 键盘导航（PageDown/Up/Home/End）正常工作
- [ ] `prefers-reduced-motion` 下动画全部禁用
- [ ] OG 图片在社交平台预览正常（Facebook/Twitter）
- [ ] 数字分身 API 在 Edge Runtime 下流式返回正常
- [ ] TTS 在 Safari/Chrome/Firefox 均正常工作

---

*文档版本：v1.0.0 | 最后更新：2026-05-08*