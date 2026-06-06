"use client";

import { useState, Suspense } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { getEnabledPlugins, type Plugin } from "@/lib/plugins";
import { ChevronLeft } from "@/components/icons";

export default function Tools() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activePlugin, setActivePlugin] = useState<Plugin | null>(null);
  const plugins = getEnabledPlugins();

  return (
    <section id="lab" className="snap-section py-24 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2 font-mono">
            <span className="neon-text-cyan">06.</span>{" "}
            <span className="text-text-primary">实验室 / Lab</span>
          </h2>
          <div className="neon-line mb-12" />
        </motion.div>

        <AnimatePresence mode="wait">
          {activePlugin ? (
            /* Inline tool panel */
            <motion.div
              key="tool-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header: back button + tabs */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setActivePlugin(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono text-text-secondary hover:text-neon-cyan hover:bg-neon-cyan/5 border border-white/10 hover:border-neon-cyan/30 transition-all"
                >
                  <ChevronLeft width={14} height={14} />
                  返回
                </button>

                <div className="flex items-center gap-1 bg-bg-card rounded-lg p-1 border border-white/5">
                  {plugins.map((plugin) => {
                    const isActive = activePlugin.id === plugin.id;
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
              </div>

              {/* Tool content — responsive height: dvh on mobile, fixed on desktop */}
              <div className="neon-border rounded-2xl bg-bg-secondary overflow-hidden min-h-[60dvh] md:min-h-[500px]">
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
          ) : (
            /* Plugin cards */
            <motion.div
              key="tool-cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 gap-6 mb-8"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
