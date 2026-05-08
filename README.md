# Li Yang — Personal Website

Cyberpunk-themed personal portfolio built with Next.js, featuring a 3D particle background, Framer Motion animations, and AI-powered digital twin chat.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| 3D Background | Three.js + @react-three/fiber |
| AI Chat | Anthropic Claude API (Edge Runtime) |
| TTS | Web Speech API |

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Then edit .env.local and add your ANTHROPIC_API_KEY

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for digital twin chat |
| `NEXT_PUBLIC_SITE_URL` | No | Site URL for OG images (default: `https://liyang.dev`) |

## Features

- **Hero** — 3D particle field + typewriter title effect
- **About / Skills / Experience / Projects / Contact** — animated scroll-driven sections
- **Tools** — plugin system with TTS and AI chat tools
- **Digital Twin Chat** — Claude-powered chatbot that speaks as Li Yang
- **OG Image** — auto-generated Open Graph image at `/opengraph-image`
- **SEO** — metadata, sitemap, robots.txt, JSON-LD schema
- **Accessibility** — reduced motion support, semantic HTML, ARIA labels

## Build

```bash
npm run build    # Production build
npm run start    # Start production server
```

## Deploy

Vercel is recommended. Set `ANTHROPIC_API_KEY` in the Vercel project environment variables.

```bash
npm install -g vercel
vercel
```
