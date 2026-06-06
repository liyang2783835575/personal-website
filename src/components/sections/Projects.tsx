"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { resume } from "@/data/resume";
import { cn } from "@/lib/utils";
import TiltCard from "@/components/ui/TiltCard";
import ProjectDetail from "./ProjectDetail";

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedProject, setSelectedProject] = useState<
    (typeof resume.projects)[number] | null
  >(null);

  // Declare open/close BEFORE the effects that use them. Effects run after
  // render so the runtime is fine, but the linter / React Compiler require
  // declaration order.
  const open = useCallback((project: (typeof resume.projects)[number]) => {
    setSelectedProject(project);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("project", project.name);
      window.history.pushState(null, "", url.toString());
    }
  }, []);

  const close = useCallback(() => {
    setSelectedProject(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("project");
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  // Deep-link via ?project=<slug> so refresh / back-button work
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("project");
    if (slug) {
      const found = resume.projects.find((p) => p.name === slug);
      if (found) setSelectedProject(found);
    }
  }, []);

  // Esc closes detail
  useEffect(() => {
    if (!selectedProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProject, close]);

  // resume.projects is a module-level constant, so the bucketed lists below
  // never change for the lifetime of the page. Memoizing them keeps the
  // three un-memoized filter passes off the per-frame render path.
  const featuredProject = useMemo(
    () => resume.projects.find((p) => p.featured),
    [],
  );
  const backendProjects = useMemo(
    () => resume.projects.filter((p) => p.category === "enterprise" && !p.featured),
    [],
  );
  const personalProjects = useMemo(
    () =>
      resume.projects.filter(
        (p) => p.category === "personal" || (!p.category && !p.featured),
      ),
    [],
  );
  const allExpandable = useMemo(
    () => resume.projects.filter((p) => p.highlights),
    [],
  );

  return (
    <section
      id="projects"
      className="snap-section py-16 md:py-20 px-6 cyber-grid flex flex-col"
      ref={ref}
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col min-h-0 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="shrink-0"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2 font-mono">
            <span className="neon-text-cyan">04.</span>{" "}
            <span className="text-text-primary">项目</span>
          </h2>
          <div className="neon-line mb-6" />
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {selectedProject ? (
            <ProjectDetail
              key="project-detail"
              project={selectedProject}
              onBack={close}
            />
          ) : (
            <motion.div
              key="projects-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="section-scroll-area flex-1 min-h-0 pr-1"
            >
              {/* Featured enterprise project */}
              {featuredProject && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="mb-6"
                >
                  <FeaturedCard
                    project={featuredProject}
                    onClick={() => open(featuredProject)}
                  />
                </motion.div>
              )}

              {/* Backend services category */}
              {backendProjects.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex items-center gap-4 mb-5"
                  >
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                    <span className="text-xs font-mono text-neon-cyan tracking-widest whitespace-nowrap">
                      后台服务
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-5 mb-6">
                    {backendProjects.map((project, i) => {
                      const isExpandable = allExpandable.includes(project);
                      return (
                        <motion.div
                          key={project.name}
                          initial={{ opacity: 0, y: 30 }}
                          animate={inView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }}
                        >
                          {isExpandable ? (
                            <button
                              onClick={() => open(project)}
                              className="w-full text-left group cursor-pointer"
                            >
                              <BackendCard project={project} />
                            </button>
                          ) : (
                            <BackendCard project={project} />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Personal projects category */}
              {personalProjects.length > 0 && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.45 }}
                    className="flex items-center gap-4 mb-5"
                  >
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                    <span className="text-xs font-mono text-neon-cyan tracking-widest whitespace-nowrap">
                      个人项目
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                  </motion.div>

                  <div className="flex flex-nowrap md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible snap-x md:snap-none pb-2 md:pb-0">
                    {personalProjects.map((project, i) => {
                      const isLinked = Boolean(project.link);
                      const cardClass = cn(
                        "h-full rounded-xl p-5 bg-bg-card neon-border overflow-hidden relative",
                        isLinked && "group cursor-pointer"
                      );
                      const titleClass = cn(
                        "text-lg font-bold text-text-primary mb-2 transition-colors",
                        isLinked && "group-hover:text-neon-cyan"
                      );
                      const inner = (
                        <>
                          <div className="w-9 h-9 rounded-lg bg-neon-cyan/10 flex items-center justify-center mb-3 text-neon-cyan">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                          <h3 className={titleClass}>{project.name}</h3>
                          <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.tech.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 text-xs font-mono rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          {isLinked && (
                            <span className="absolute top-4 right-4 text-text-muted group-hover:text-neon-cyan transition-colors">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                              >
                                <path d="M7 17L17 7M17 7H7M17 7v10" />
                              </svg>
                            </span>
                          )}
                        </>
                      );
                      return (
                        <motion.div
                          key={project.name}
                          initial={{ opacity: 0, y: 30 }}
                          animate={inView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                          className="min-w-[280px] md:min-w-0 snap-start"
                        >
                          {isLinked ? (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 rounded-xl"
                              aria-label={`${project.name} — 打开外部链接`}
                            >
                              <TiltCard className={cardClass}>{inner}</TiltCard>
                            </a>
                          ) : (
                            <TiltCard className={cardClass}>{inner}</TiltCard>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function FeaturedCard({
  project,
  onClick,
}: {
  project: (typeof resume.projects)[number];
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full text-left group cursor-pointer">
      <TiltCard className="relative rounded-xl p-5 md:p-6 neon-border-magenta featured-card bg-bg-card overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-neon-magenta/10 flex items-center justify-center text-neon-magenta">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded border border-neon-magenta/30 text-neon-magenta bg-neon-magenta/5">
            ENTERPRISE
          </span>
          <span className="ml-auto text-xs font-mono text-text-muted group-hover:text-neon-magenta transition-colors">
            点击查看详情 →
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2 group-hover:text-neon-magenta transition-colors">
          {project.name}
        </h3>
        <p className="text-sm md:text-base text-text-secondary mb-4 leading-relaxed max-w-3xl">
          {project.description}
        </p>
        {project.metrics && (
          <div className="flex flex-wrap gap-2 mb-3">
            {project.metrics.map((m) => (
              <span
                key={m}
                className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-neon-magenta/5 text-neon-magenta border border-neon-magenta/20"
              >
                {m}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-xs font-mono rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
            >
              {t}
            </span>
          ))}
        </div>
      </TiltCard>
    </button>
  );
}

function BackendCard({
  project,
}: {
  project: (typeof resume.projects)[number];
}) {
  return (
    <TiltCard className="h-full rounded-xl p-5 bg-bg-card neon-border overflow-hidden relative group-hover:border-neon-cyan/30 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded border border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5">
          SERVER
        </span>
        <span className="ml-auto text-xs font-mono text-text-muted group-hover:text-neon-cyan transition-colors">
          点击查看详情 →
        </span>
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-neon-cyan transition-colors">
        {project.name}
      </h3>
      <p className="text-sm text-text-secondary mb-3 leading-relaxed">
        {project.description}
      </p>
      {project.metrics && (
        <div className="flex flex-wrap gap-2 mb-3">
          {project.metrics.map((m) => (
            <span
              key={m}
              className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-neon-cyan/5 text-neon-cyan border border-neon-cyan/20"
            >
              {m}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 text-xs font-mono rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
          >
            {t}
          </span>
        ))}
      </div>
    </TiltCard>
  );
}
