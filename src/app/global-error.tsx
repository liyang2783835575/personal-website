"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body
        style={{
          background: "#0a0a0f",
          color: "#e8e8f0",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "#ff00aa",
            }}
          >
            系统级错误
          </h1>
          <p
            style={{
              color: "#8888aa",
              marginBottom: "1.5rem",
              fontSize: "0.875rem",
            }}
          >
            渲染框架本身出错了。这通常是缓存或部署问题。
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              border: "1px solid #00fff9",
              color: "#00fff9",
              background: "transparent",
              borderRadius: "9999px",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
