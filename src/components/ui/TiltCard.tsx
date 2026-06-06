"use client";

import { type MouseEvent, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function TiltCard({ children, className }: TiltCardProps) {
  const reducedMotion = useReducedMotion();

  // rAF batching: coalesce a burst of mousemove events into a single style
  // write per frame. Without this, a fast mouse can fire 200+ style writes
  // per second; with it, we cap at the display refresh rate.
  const rafRef = useRef<number | null>(null);
  const lastEventRef = useRef<MouseEvent<HTMLDivElement> | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    lastEventRef.current = e;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const last = lastEventRef.current;
      if (!last) return;
      const card = last.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = last.clientX - rect.left;
      const y = last.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastEventRef.current = null;
    if (reducedMotion) return;
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
