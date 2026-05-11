"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { resume } from "@/data/resume";
import TiltCard from "@/components/ui/TiltCard";
import ProjectDetail from "./ProjectDetail";

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [showDetail, setShowDetail] = useState(false);

  const featuredProject = resume.projects.find((p) => p.featured);
  const personalProjects = resume.projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="snap-section py-24 px-6 cyber-grid" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2 font-mono">
            <span className="neon-text-cyan">04.</span>{" "}
            <span className="text-text-primary">项目</span>
          </h2>
          <div className="neon-line mb-12" />
        </motion.div>

        <AnimatePresence mode="wait">
          {showDetail && featuredProject ? (
            <ProjectDetail
              key="project-detail"
              project={featuredProject}
              onBack={() => setShowDetail(false)}
            />
          ) : (
            <motion.div
              key="projects-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Featured enterprise project */}
              {featuredProject && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="mb-10"
                >
                  <button
                    onClick={() => setShowDetail(true)}
                    className="w-full text-left group cursor-pointer"
                  >
                    <TiltCard className="relative rounded-xl p-6 md:p-8 neon-border-magenta featured-card bg-bg-card overflow-hidden">
                      {/* Top row: icon + enterprise badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-neon-magenta/10 flex items-center justify-center text-neon-magenta">
                          <svg
                            width="20"
                            height="20"
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

                      <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3 group-hover:text-neon-magenta transition-colors">
                        {featuredProject.name}
                      </h3>
                      <p className="text-sm md:text-base text-text-secondary mb-5 leading-relaxed max-w-3xl">
                        {featuredProject.description}
                      </p>

                      {/* Metrics */}
                      {featuredProject.metrics && (
                        <div className="flex flex-wrap gap-3 mb-5">
                          {featuredProject.metrics.map((m) => (
                            <span
                              key={m}
                              className="px-3 py-1 text-xs font-mono rounded-full bg-neon-magenta/5 text-neon-magenta border border-neon-magenta/20"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tech tags */}
                      <div className="flex flex-wrap gap-2">
                        {featuredProject.tech.map((t) => (
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
                </motion.div>
              )}

              {/* Category divider */}
              {personalProjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  className="flex items-center gap-4 mb-8"
                >
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                  <span className="text-xs font-mono text-neon-cyan tracking-widest whitespace-nowrap">
                    个人项目
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                </motion.div>
              )}

              {/* Personal projects grid */}
              <div className="flex flex-nowrap md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0">
                {personalProjects.map((project, i) => (
                  <motion.div
                    key={project.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    className="min-w-[280px] md:min-w-0 snap-start"
                  >
                    <TiltCard className="h-full rounded-xl p-6 bg-bg-card neon-border overflow-hidden relative group cursor-default">
                      {/* Project icon */}
                      <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center mb-4 text-neon-cyan">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>

                      <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-neon-cyan transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Tech tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 text-xs font-mono rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Link arrow */}
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-4 right-4 text-text-muted hover:text-neon-cyan transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M7 17L17 7M17 7H7M17 7v10" />
                          </svg>
                        </a>
                      )}
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
