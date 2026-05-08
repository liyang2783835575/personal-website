"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type MouseEvent } from "react";
import { resume } from "@/data/resume";

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
  };

  return (
    <div
      className={`tilt-card ${className || ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-shine" />
      {children}
    </div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

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

        <div className="flex flex-nowrap md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0">
          {resume.projects.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="min-w-[280px] md:min-w-0 snap-start"
            >
              <TiltCard className="h-full rounded-xl p-6 bg-bg-card neon-border overflow-hidden relative group cursor-pointer">
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
      </div>
    </section>
  );
}
