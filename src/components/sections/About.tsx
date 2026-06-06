"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { resume } from "@/data/resume";

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="snap-section py-24 px-6 cyber-grid" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2 font-mono">
            <span className="neon-text-cyan">01.</span>{" "}
            <span className="text-text-primary">关于我</span>
          </h2>
          <div className="neon-line mb-12" />
        </motion.div>

        <div className="grid md:grid-cols-5 gap-12 items-center">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2 flex justify-center"
          >
            <div className="relative group">
              <div className="w-48 h-48 rounded-full overflow-hidden neon-border p-1">
                <div className="w-full h-full rounded-full bg-bg-secondary flex items-center justify-center text-6xl">
                  👨‍💻
                </div>
              </div>
              {/* Glow ring on hover */}
              <div className="absolute inset-0 rounded-full bg-neon-cyan/5 group-hover:bg-neon-cyan/10 transition-colors duration-500 -z-10 blur-xl" />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-3 space-y-4"
          >
            <p className="text-text-secondary leading-relaxed">
              {resume.bio}
            </p>
            <p className="text-text-secondary leading-relaxed">
              我相信技术是表达创造力的工具。无论是构建一个优雅的 Web 应用，
              还是设计一个有趣的小游戏，我都享受从零到一的过程。
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              {resume.contacts.github && (
                <a
                  href={resume.contacts.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full text-xs font-mono neon-border text-neon-cyan hover:shadow-[var(--glow-sm)] transition-all"
                >
                  GitHub
                </a>
              )}
              {resume.contacts.email && (
                <a
                  href={`mailto:${resume.contacts.email}`}
                  className="px-4 py-2 rounded-full text-xs font-mono neon-border text-neon-cyan hover:shadow-[var(--glow-sm)] transition-all"
                >
                  Email
                </a>
              )}
              {resume.contacts.wechat && (
                <span className="px-4 py-2 rounded-full text-xs font-mono neon-border text-neon-cyan">
                  WeChat: {resume.contacts.wechat}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
