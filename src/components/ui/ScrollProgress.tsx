"use client";

import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  sections: { id: string; label: string }[];
  activeId: string;
}

export default function ScrollProgress({
  sections,
  activeId,
}: ScrollProgressProps) {
  if (sections.length === 0) return null;

  return (
    <nav
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-4"
      aria-label="页面导航"
    >
      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <button
            key={section.id}
            onClick={() => {
              document
                .getElementById(section.id)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
              "flex items-center gap-3 group cursor-pointer bg-transparent border-none p-0"
            )}
            aria-label={`跳转到 ${section.label}`}
          >
            <span
              className={cn(
                "font-mono text-xs transition-colors duration-200",
                isActive ? "text-neon-cyan" : "text-text-muted"
              )}
            >
              {section.label}
            </span>
            <span
              data-testid={`dot-${section.id}`}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-200",
                isActive ? "bg-neon-cyan" : "bg-text-muted"
              )}
              style={
                isActive
                  ? { boxShadow: "0 0 5px var(--neon-cyan)" }
                  : undefined
              }
            />
          </button>
        );
      })}
    </nav>
  );
}
