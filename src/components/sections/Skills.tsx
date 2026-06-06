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

// Bucket skills into 3 tiers based on level. No more "TypeScript 90% vs Docker 65%" comparisons.
const tierFor = (level: number): "daily" | "proficient" | "familiar" =>
  level >= 80 ? "daily" : level >= 65 ? "proficient" : "familiar";

const tierLabel = {
  daily: "日常主力",
  proficient: "熟练",
  familiar: "了解",
} as const;

const tierDot = {
  daily: "bg-neon-cyan",
  proficient: "bg-neon-magenta",
  familiar: "bg-text-muted",
} as const;

const tierOrder: (keyof typeof tierLabel)[] = [
  "daily",
  "proficient",
  "familiar",
];

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reducedMotion = useReducedMotion();

  // Group by category, then by tier
  const grouped = resume.skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = {};
      const tier = tierFor(skill.level);
      const byTier = acc[skill.category]!;
      if (!byTier[tier]) byTier[tier] = [];
      byTier[tier]!.push(skill);
      return acc;
    },
    {} as Record<
      string,
      Partial<Record<keyof typeof tierLabel, typeof resume.skills>>
    >,
  );

  return (
    <section
      id="skills"
      className="snap-section py-24 px-6 cyber-grid"
      ref={ref}
    >
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
          <div className="neon-line mb-4" />
          <p className="text-sm text-text-secondary mb-12 max-w-xl">
            按使用频率分三档：
            <span className="text-neon-cyan">日常主力</span> /{" "}
            <span className="text-neon-magenta">熟练</span> /{" "}
            <span className="text-text-muted">了解</span>
            。不分具体百分比。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(grouped).map(([category, byTier], gi) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: reducedMotion ? 0 : gi * 0.15,
              }}
              className="rounded-xl p-6 bg-bg-card neon-border"
            >
              <h3 className="text-sm font-mono text-neon-cyan mb-4 tracking-wider uppercase">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="space-y-4">
                {tierOrder.map((tier) => {
                  const list = byTier[tier];
                  if (!list || list.length === 0) return null;
                  return (
                    <div key={tier}>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${tierDot[tier]}`}
                          aria-hidden="true"
                        />
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                          {tierLabel[tier]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((skill) => (
                          <span
                            key={skill.name}
                            className="px-2.5 py-1 text-xs font-mono rounded bg-white/5 text-text-secondary border border-white/5"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
