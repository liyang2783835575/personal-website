"use client";

/**
 * Page-level interactive shell. Owns the cross-section concerns:
 *  - active section detection (drives Navbar + ScrollProgress)
 *  - PageUp/PageDown/Home/End keyboard navigation
 *  - the scanline `section-entering` CSS class on section enter
 *
 * Lives as a single client island so `page.tsx` can stay a server
 * component — the section bodies still render server-side as
 * static HTML, and only this thin shell hydrates.
 */

import { useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { useActiveSection } from "@/hooks/useActiveSection";

const SECTION_LABELS: Record<string, string> = {
  hero: "首页",
  about: "关于",
  skills: "技能",
  experience: "经历",
  projects: "项目",
  contact: "联系",
  lab: "Lab",
};

interface Props {
  sectionIds: readonly string[];
  children: React.ReactNode;
}

export default function HomeShell({ sectionIds, children }: Props) {
  const { activeId } = useActiveSection(sectionIds);

  // Keyboard navigation: PageDown/Up, Home/End (no arrow keys — they fight scroll-snap)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const currentIndex = sectionIds.indexOf(activeId);
      if (currentIndex === -1) return;

      let targetIndex: number | null = null;

      switch (e.key) {
        case "PageDown":
          e.preventDefault();
          targetIndex = Math.min(currentIndex + 1, sectionIds.length - 1);
          break;
        case "PageUp":
          e.preventDefault();
          targetIndex = Math.max(currentIndex - 1, 0);
          break;
        case "Home":
          e.preventDefault();
          targetIndex = 0;
          break;
        case "End":
          e.preventDefault();
          targetIndex = sectionIds.length - 1;
          break;
      }

      if (targetIndex !== null && targetIndex !== currentIndex) {
        const el = document.getElementById(sectionIds[targetIndex]);
        el?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [activeId, sectionIds],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scanline transition effect on section enter
  useEffect(() => {
    const el = document.getElementById(activeId);
    if (!el) return;
    el.classList.add("section-entering");
    const timer = setTimeout(() => el.classList.remove("section-entering"), 700);
    return () => clearTimeout(timer);
  }, [activeId]);

  const sections = sectionIds.map((id) => ({ id, label: SECTION_LABELS[id] ?? id }));

  return (
    <>
      <Navbar activeId={activeId} />
      <main className="snap-container neon-gradient-bg">{children}</main>
      <Footer />
      <ScrollProgress sections={sections} activeId={activeId} />
    </>
  );
}
