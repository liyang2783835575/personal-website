"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { resume } from "@/data/resume";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const categoryLabels = {
  frontend: "前端",
  backend: "后端",
  tool: "工具",
  other: "其他",
};

const categoryBarStyle = {
  frontend: { background: "var(--neon-cyan)", boxShadow: "0 0 8px var(--neon-cyan)" },
  backend: { background: "var(--neon-magenta)", boxShadow: "0 0 8px var(--neon-magenta)" },
  tool: { background: "var(--neon-purple)", boxShadow: "0 0 8px var(--neon-purple)" },
  other: { background: "var(--neon-blue)", boxShadow: "0 0 8px var(--neon-blue)" },
} as const;

type Category = keyof typeof categoryBarStyle;

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reducedMotion = useReducedMotion();

  const grouped = resume.skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, typeof resume.skills>
  );

  return (
    <section id="skills" className="snap-section py-24 px-6 cyber-grid" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2 font-mono">
            <span className="neon-text-cyan">02.</span>{" "}
            <span className="text-text-primary">技能</span>
          </h2>
          <div className="neon-line mb-12" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(grouped).map(([category, skills], gi) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: gi * 0.15 }}
              className="rounded-xl p-6 bg-bg-card neon-border"
            >
              <h3 className="text-sm font-mono text-neon-cyan mb-4 tracking-wider uppercase">
                {categoryLabels[category as Category]}
              </h3>
              <div className="space-y-4">
                {skills.map((skill, si) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-text-primary font-mono">
                        {skill.name}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                      <motion.div
                        initial={reducedMotion ? { width: `${skill.level}%` } : { width: 0 }}
                        animate={inView ? { width: `${skill.level}%` } : {}}
                        transition={reducedMotion ? {} : {
                          duration: 1,
                          delay: gi * 0.15 + si * 0.08,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={categoryBarStyle[category as Category]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
