"use client";

import { useState, Suspense } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { getEnabledPlugins, type Plugin } from "@/lib/plugins";

export default function Tools() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activePlugin, setActivePlugin] = useState<Plugin | null>(null);
  const plugins = getEnabledPlugins();

  return (
    <section id="tools" className="snap-section py-24 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2 font-mono">
            <span className="neon-text-cyan">05.</span>{" "}
            <span className="text-text-primary">工具箱</span>
          </h2>
          <div className="neon-line mb-12" />
        </motion.div>

        {/* Plugin cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {plugins.map((plugin, i) => (
            <motion.button
              key={plugin.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => setActivePlugin(plugin)}
              className="text-left rounded-xl p-6 bg-bg-card neon-border group hover:bg-bg-card-hover hover:shadow-[var(--glow-sm)] transition-all duration-300 cursor-pointer"
            >
              <div className="text-3xl mb-3">{plugin.icon}</div>
              <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-neon-cyan transition-colors">
                {plugin.name}
              </h3>
              <p className="text-sm text-text-secondary">
                {plugin.description}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Tool Panel (Drawer) */}
        <AnimatePresence>
          {activePlugin && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActivePlugin(null)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xl bg-bg-secondary neon-border-l overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-3 glass border-b border-white/5">
                  {/* Tab bar */}
                  <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
                    {plugins.map((plugin) => {
                      const isActive = activePlugin?.id === plugin.id;
                      return (
                        <button
                          key={plugin.id}
                          onClick={() => setActivePlugin(plugin)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                            isActive
                              ? "bg-neon-cyan/10 text-neon-cyan shadow-[var(--glow-xs)]"
                              : "text-text-muted hover:text-text-primary hover:bg-white/5"
                          }`}
                        >
                          <span>{plugin.icon}</span>
                          <span>{plugin.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Close button */}
                  <button
                    onClick={() => setActivePlugin(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Plugin content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                      </div>
                    }
                  >
                    <activePlugin.component />
                  </Suspense>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
