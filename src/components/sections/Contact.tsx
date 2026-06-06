"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { resume } from "@/data/resume";

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (!resume.contacts.email) return;
    try {
      await navigator.clipboard.writeText(resume.contacts.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be blocked — silently no-op */
    }
  };

  return (
    <section id="contact" className="snap-section py-24 px-6 cyber-grid" ref={ref}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-mono text-neon-magenta mb-2 tracking-widest uppercase">
            Get In Touch
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary">
            联系我
          </h2>
          <p className="text-text-secondary mb-10 leading-relaxed">
            如果你有项目合作、技术交流，或者只是想打个招呼，欢迎随时联系我。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {resume.contacts.email && (
            <a
              href={`mailto:${resume.contacts.email}`}
              className="px-8 py-3 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 hover:shadow-[var(--glow-sm)] transition-all duration-300 font-mono text-sm"
            >
              发送邮件
            </a>
          )}
          {resume.contacts.email && (
            <button
              type="button"
              onClick={copyEmail}
              aria-live="polite"
              className="px-8 py-3 rounded-full border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 transition-all duration-300 font-mono text-sm"
            >
              {copied ? "已复制 ✓" : "复制邮箱"}
            </button>
          )}
          {resume.contacts.github && (
            <a
              href={resume.contacts.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-full border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 transition-all duration-300 font-mono text-sm"
            >
              GitHub
            </a>
          )}
        </motion.div>

        {/* Decorative neon line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16"
        >
          <div className="neon-line" />
        </motion.div>
      </div>
    </section>
  );
}
