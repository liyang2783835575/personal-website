"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import GlitchText from "@/components/effects/GlitchText";
import { resume } from "@/data/resume";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Lazy-load the heavy Three.js particle field
const ParticleField = dynamic(
  () => import("@/components/effects/ParticleField"),
  { ssr: false }
);

const titles = [
  "Full-Stack Developer",
  "AI Application Builder",
  "Game Creator",
  "Creative Coder",
];

function useTypewriter(words: string[], speed = 100, pause = 2000) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex < current.length) {
      timer = setTimeout(() => {
        setText(current.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, speed);
    } else if (!deleting && charIndex === current.length) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex > 0) {
      timer = setTimeout(() => {
        setText(current.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, speed / 2);
    } else {
      setDeleting(false);
      setWordIndex((wordIndex + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, deleting, wordIndex, words, speed, pause]);

  return text;
}

export default function Hero() {
  const typedText = useTypewriter(titles, 80, 2000);
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="snap-section relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Particle Background */}
      <ParticleField />

      {/* Gradient overlay for readability (above canvas, below content) */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-bg-primary pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-sm font-mono text-neon-cyan mb-4 tracking-widest uppercase">
            Welcome to my digital space
          </p>

          <GlitchText
            text={resume.name}
            as="h1"
            className="text-5xl md:text-7xl font-bold mb-6"
          />

          <div className="h-12 mb-8">
            <span className="text-xl md:text-2xl font-mono text-neon-magenta">
              {typedText}
            </span>
            <span className="typing-cursor" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-text-secondary text-lg mb-10 max-w-xl mx-auto leading-relaxed"
        >
          {resume.bio}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#projects"
            className="px-8 py-3 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 hover:shadow-[var(--glow-sm)] transition-all duration-300 font-mono text-sm"
          >
            查看项目
          </a>
          <a
            href="#contact"
            className="px-8 py-3 rounded-full border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 transition-all duration-300 font-mono text-sm"
          >
            联系我
          </a>
        </motion.div>

      </div>

      {/* Scroll indicator — anchored to section bottom */}
      {!reducedMotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-5 h-8 border-2 border-neon-cyan/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 bg-neon-cyan rounded-full mt-1.5"
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
