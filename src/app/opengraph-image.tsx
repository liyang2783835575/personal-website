import { ImageResponse } from "next/og";
import { resume } from "@/data/resume";

export const runtime = "edge";
export const alt = `${resume.name} — ${resume.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(0,255,249,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(176,38,255,0.18) 0%, transparent 55%), #0a0a0f",
          color: "#e0e0ff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
            fontSize: "20px",
            fontFamily: "monospace",
            color: "#00fff9",
            letterSpacing: "0.2em",
          }}
        >
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "999px",
              background: "#00fff9",
              boxShadow: "0 0 14px #00fff9",
            }}
          />
          WELCOME TO MY DIGITAL SPACE
        </div>

        <div
          style={{
            fontSize: "140px",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            textShadow:
              "0 0 24px rgba(0,255,249,0.45), 0 0 48px rgba(176,38,255,0.35)",
          }}
        >
          {resume.name}
        </div>

        <div
          style={{
            fontSize: "48px",
            fontFamily: "monospace",
            color: "#ff00ff",
            marginTop: "12px",
            textShadow: "0 0 14px rgba(255,0,255,0.5)",
          }}
        >
          {resume.title}
        </div>

        <div
          style={{
            fontSize: "26px",
            color: "#8888aa",
            marginTop: "32px",
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          {resume.bio.length > 90 ? `${resume.bio.slice(0, 88)}…` : resume.bio}
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "48px",
            fontSize: "20px",
            fontFamily: "monospace",
            color: "#00fff9",
          }}
        >
          {["Next.js", "Three.js", "Claude API", "Tailwind"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(0,255,249,0.4)",
                background: "rgba(0,255,249,0.08)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
