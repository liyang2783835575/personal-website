"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "首页", href: "#hero" },
  { label: "关于", href: "#about" },
  { label: "技能", href: "#skills" },
  { label: "经历", href: "#experience" },
  { label: "项目", href: "#projects" },
  { label: "联系", href: "#contact" },
  { label: "Lab", href: "#lab" },
];

interface NavbarProps {
  activeId?: string;
}

export default function Navbar({ activeId }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Scroll happens inside .snap-container / <main>, not on window.
    // Find the actual scrolling element and listen there.
    const container =
      document.querySelector<HTMLElement>(".snap-container") ??
      (document.scrollingElement as HTMLElement | null);
    if (!container) return;

    const onScroll = () => setScrolled(container.scrollTop > 50);
    onScroll(); // sync initial state
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass neon-border shadow-lg" : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          className="text-lg font-bold font-mono tracking-wider neon-text-cyan"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#hero");
          }}
        >
          LY<span className="text-neon-magenta">.</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const sectionId = link.href.replace("#", "");
            const isActive = sectionId === activeId;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative px-3 py-2 text-sm transition-colors duration-200 font-mono",
                  isActive
                    ? "text-neon-cyan"
                    : "text-text-secondary hover:text-neon-cyan",
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-px bg-neon-cyan shadow-[0_0_4px_var(--neon-cyan)]" />
                )}
              </a>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={cn(
              "w-5 h-0.5 bg-neon-cyan transition-transform duration-300",
              mobileOpen && "rotate-45 translate-y-2",
            )}
          />
          <span
            className={cn(
              "w-5 h-0.5 bg-neon-cyan transition-opacity duration-300",
              mobileOpen && "opacity-0",
            )}
          />
          <span
            className={cn(
              "w-5 h-0.5 bg-neon-cyan transition-transform duration-300",
              mobileOpen && "-rotate-45 -translate-y-2",
            )}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const sectionId = link.href.replace("#", "");
                const isActive = sectionId === activeId;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "py-2 text-sm transition-colors font-mono",
                      isActive
                        ? "text-neon-cyan"
                        : "text-text-secondary hover:text-neon-cyan",
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
