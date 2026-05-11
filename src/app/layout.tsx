import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { resume } from "@/data/resume";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://liyang.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${resume.name} | ${resume.title}`,
    template: `%s | ${resume.name}`,
  },
  description: resume.bio,
  keywords: [
    "Li Yang",
    "个人网站",
    "全栈开发",
    "AI 应用",
    "Next.js",
    "React",
    "TypeScript",
    "Cloudflare Workers",
    "Cocos Creator",
  ],
  authors: [{ name: resume.name }],
  creator: resume.name,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: `${resume.name} — Digital Space`,
    title: `${resume.name} | ${resume.title}`,
    description: resume.bio,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${resume.name} — ${resume.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${resume.name} | ${resume.title}`,
    description: resume.bio,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: resume.name,
    description: resume.bio,
    jobTitle: resume.title,
    url: SITE_URL,
    sameAs: [resume.contacts.github, resume.contacts.linkedin].filter(Boolean),
  };

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-bg-primary text-text-primary">
        {children}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
