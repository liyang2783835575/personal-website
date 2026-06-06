"use client";

import { motion } from "framer-motion";
import type { ResumeData } from "@/data/resume";
import { ChevronLeft } from "@/components/icons";

type Project = ResumeData["projects"][number];

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

const HIGHLIGHT_ICONS = [
  // Dual pipeline
  <svg key="pipeline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>,
  // Reactive / async
  <svg key="async" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="1 4 1 10 7 10" />
    <polyline points="23 20 23 14 17 14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
  </svg>,
  // DAG / graph
  <svg key="dag" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
    <line x1="12" y1="7" x2="5" y2="17" />
    <line x1="12" y1="7" x2="19" y2="17" />
  </svg>,
  // Rule engine / gear
  <svg key="gear" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>,
  // Shield / fault tolerance
  <svg key="shield" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>,
  // Shell / matching
  <svg key="shell" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>,
];

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const isEnterprise = project.category === "enterprise";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header: back button + tab */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/5 border border-white/10 hover:border-neon-cyan/30 transition-all"
        >
          <ChevronLeft width={14} height={14} />
          返回
        </button>

        <div className="flex items-center gap-1 bg-bg-card rounded-lg p-1 border border-white/5">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-neon-cyan/10 text-neon-cyan shadow-[var(--glow-xs)]">
            项目详情
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className={`neon-border rounded-2xl bg-bg-secondary overflow-hidden ${
          isEnterprise ? "neon-border-magenta" : ""
        }`}
      >
        <div className="section-scroll-area max-h-[calc(100vh-14rem)] p-6 md:p-8">
          {/* Project name */}
          <div className="flex items-center gap-3 mb-2">
            {isEnterprise && (
              <span className="text-xs font-mono px-2 py-0.5 rounded border border-neon-magenta/30 text-neon-magenta bg-neon-magenta/5">
                ENTERPRISE
              </span>
            )}
          </div>
          <h3
            className={`text-2xl md:text-3xl font-bold mb-3 ${
              isEnterprise ? "neon-text-magenta" : "text-text-primary"
            }`}
          >
            {project.name}
          </h3>
          {project.summary && (
            <p
              className={`text-base md:text-lg leading-relaxed max-w-3xl mb-6 px-4 py-3 rounded-lg border-l-2 ${
                isEnterprise
                  ? "text-text-primary border-neon-magenta bg-neon-magenta/5"
                  : "text-text-primary border-neon-cyan bg-neon-cyan/5"
              }`}
            >
              {project.summary}
            </p>
          )}
          <details className="mb-8 group">
            <summary className="text-xs font-mono text-text-muted cursor-pointer hover:text-neon-cyan uppercase tracking-wider select-none">
              技术描述 (展开)
            </summary>
            <p className="text-sm md:text-base text-text-secondary mt-3 leading-relaxed max-w-3xl">
              {project.description}
            </p>
          </details>

          <div className="neon-line mb-8" />

          {/* Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="mb-8">
              <h4 className="text-sm font-mono text-text-muted mb-4 uppercase tracking-wider">
                技术亮点
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {project.highlights.map((h, i) => (
                  <div
                    key={h.title}
                    className={`rounded-xl p-5 border transition-colors ${
                      isEnterprise
                        ? "bg-neon-magenta/[0.02] border-neon-magenta/15 hover:border-neon-magenta/30"
                        : "bg-neon-cyan/[0.02] border-neon-cyan/15 hover:border-neon-cyan/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 shrink-0 ${
                          isEnterprise ? "text-neon-magenta" : "text-neon-cyan"
                        }`}
                      >
                        {HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-text-primary mb-1.5">
                          {h.title}
                        </h5>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {h.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="mb-8">
              <h4 className="text-sm font-mono text-text-muted mb-4 uppercase tracking-wider">
                关键指标
              </h4>
              <div className="flex flex-wrap gap-3">
                {project.metrics.map((m) => (
                  <span
                    key={m}
                    className={`px-3 py-1.5 text-sm font-mono rounded-full border ${
                      isEnterprise
                        ? "bg-neon-magenta/5 text-neon-magenta border-neon-magenta/20"
                        : "bg-neon-cyan/5 text-neon-cyan border-neon-cyan/20"
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full tech stack */}
          <div className="mb-8">
            <h4 className="text-sm font-mono text-text-muted mb-4 uppercase tracking-wider">
              技术栈
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 text-xs font-mono rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-xs text-text-muted font-mono pt-4 border-t border-white/5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan hover:underline"
              >
                查看源码 →
              </a>
            ) : (
              <span>内部企业项目 · 无公开链接</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
