"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { resume } from "@/data/resume";
import TiltCard from "@/components/ui/TiltCard";
import ProjectDetail from "./ProjectDetail";

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedProject, setSelectedProject] = useState<
    (typeof resume.projects)[number] | null
  >(null);

  const featuredProject = resume.projects.find((p) => p.featured);
  const backendProjects = resume.projects.filter(
    (p) => p.category === "enterprise" && !p.featured
  );
  const personalProjects = resume.projects.filter(
    (p) => p.category === "personal" || (!p.category && !p.featured)
  );
  const allExpandable = resume.projects.filter((p) => p.highlights);

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
          {selectedProject ? (
            <ProjectDetail
              key="project-detail"
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
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
                  <FeaturedCard
                    project={featuredProject}
                    onClick={() => setSelectedProject(featuredProject)}
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
                    className="flex items-center gap-4 mb-8"
                  >
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                    <span className="text-xs font-mono text-neon-cyan tracking-widest whitespace-nowrap">
                      后台服务
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-6 mb-10">
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
                              onClick={() => setSelectedProject(project)}
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
                    className="flex items-center gap-4 mb-8"
                  >
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                    <span className="text-xs font-mono text-neon-cyan tracking-widest whitespace-nowrap">
                      个人项目
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                  </motion.div>

                  <div className="flex flex-nowrap md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0">
                    {personalProjects.map((project, i) => (
                      <motion.div
                        key={project.name}
                        initial={{ opacity: 0, y: 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                        className="min-w-[280px] md:min-w-0 snap-start"
                      >
                        <TiltCard className="h-full rounded-xl p-6 bg-bg-card neon-border overflow-hidden relative group cursor-default">
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
      <TiltCard className="relative rounded-xl p-6 md:p-8 neon-border-magenta featured-card bg-bg-card overflow-hidden">
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
          {project.name}
        </h3>
        <p className="text-sm md:text-base text-text-secondary mb-5 leading-relaxed max-w-3xl">
          {project.description}
        </p>
        {project.metrics && (
          <div className="flex flex-wrap gap-3 mb-5">
            {project.metrics.map((m) => (
              <span
                key={m}
                className="px-3 py-1 text-xs font-mono rounded-full bg-neon-magenta/5 text-neon-magenta border border-neon-magenta/20"
              >
                {m}
              </span>
            ))}
          </div>
        )}
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
    <TiltCard className="h-full rounded-xl p-6 bg-bg-card neon-border overflow-hidden relative group-hover:border-neon-cyan/30 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
          <svg
            width="20"
            height="20"
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
      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
        {project.description}
      </p>
      {project.metrics && (
        <div className="flex flex-wrap gap-3 mb-4">
          {project.metrics.map((m) => (
            <span
              key={m}
              className="px-3 py-1 text-xs font-mono rounded-full bg-neon-cyan/5 text-neon-cyan border border-neon-cyan/20"
            >
              {m}
            </span>
          ))}
        </div>
      )}
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
    </TiltCard>
  );
}
