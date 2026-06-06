"use client";

import { useState, type ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  /** Optional right-side meta (counts, hints, etc.). */
  meta?: ReactNode;
  children: ReactNode;
}

/**
 * Reusable disclosure used by the audio-tags, director-mode, and advanced
 * settings panels. Centralizes the chevron + aria-expanded state so all three
 * sections render identically.
 */
export default function CollapsibleSection({
  title,
  defaultOpen = false,
  meta,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-xs font-mono text-text-secondary hover:text-neon-cyan transition-colors flex items-center gap-1"
      >
        <span aria-hidden="true">{open ? "▼" : "▶"}</span>
        {title}
        {meta !== undefined && (
          <span className="text-text-muted ml-1">{meta}</span>
        )}
      </button>
      {open && (
        <div className="mt-3 space-y-3 pl-4 border-l border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}
