"use client";

import { useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Tools from "@/components/sections/Tools";
import Contact from "@/components/sections/Contact";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { useActiveSection } from "@/hooks/useActiveSection";

const sectionIds = [
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "tools",
  "contact",
];

const sectionLabels: Record<string, string> = {
  hero: "首页",
  about: "关于",
  skills: "技能",
  experience: "经历",
  projects: "项目",
  tools: "工具",
  contact: "联系",
};

export default function Home() {
  const { activeId } = useActiveSection(sectionIds);

  // Keyboard navigation: PageDown/Up, Home/End, Arrow keys
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
        case "ArrowDown":
          e.preventDefault();
          targetIndex = Math.min(currentIndex + 1, sectionIds.length - 1);
          break;
        case "PageUp":
        case "ArrowUp":
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
    [activeId],
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

  const sections = sectionIds.map((id) => ({ id, label: sectionLabels[id] }));

  return (
    <>
      <Navbar activeId={activeId} />
      <main className="snap-container neon-gradient-bg">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Tools />
        <Contact />
      </main>
      <Footer />
      <ScrollProgress sections={sections} activeId={activeId} />
    </>
  );
}
