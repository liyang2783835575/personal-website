"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { resume } from "@/data/resume";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reducedMotion = useReducedMotion();

  return (
    <section id="experience" className="snap-section py-24 px-6 cyber-grid" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2 font-mono">
            <span className="neon-text-cyan">03.</span>{" "}
            <span className="text-text-primary">经历</span>
          </h2>
          <div className="neon-line mb-12" />
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/50 via-neon-purple/30 to-transparent" />

          <div className="space-y-12 section-scroll-area">
            {resume.experience.map((exp, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={`${exp.company}-${exp.period}`}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: isLeft ? -30 : 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: reducedMotion ? 0 : 0.5, delay: i * 0.2 }}
                  className={`relative flex items-start ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-neon-cyan shadow-[var(--glow-sm)] z-10 mt-6" />

                  {/* Card */}
                  <div
                    className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                      isLeft ? "md:pr-0" : "md:pl-0"
                    }`}
                  >
                    <div className="rounded-xl p-6 bg-bg-card neon-border group hover:bg-bg-card-hover transition-colors duration-300">
                      <p className="text-xs font-mono text-neon-magenta mb-1">
                        {exp.period}
                      </p>
                      <h3 className="text-lg font-bold text-text-primary mb-1">
                        {exp.role}
                      </h3>
                      <p className="text-sm font-mono text-neon-cyan mb-3">
                        {exp.company}
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
