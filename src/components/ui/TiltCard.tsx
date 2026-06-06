"use client";

import { type MouseEvent, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

interface PendingTilt {
  card: HTMLDivElement;
  clientX: number;
  clientY: number;
}

export default function TiltCard({ children, className }: TiltCardProps) {
  const reducedMotion = useReducedMotion();

  // rAF batching: coalesce a burst of mousemove events into a single style
  // write per frame. Without this, a fast mouse can fire 200+ style writes
  // per second; with it, we cap at the display refresh rate.
  //
  // We capture the element + coords into a plain object ref instead of
  // holding the React synthetic event, because `event.currentTarget` is
  // nulled out by the time the rAF callback fires (React recycles the
  // pooled event after the handler returns), and reading it then throws.
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<PendingTilt | null>(null);

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
    pendingRef.current = {
      card: e.currentTarget,
      clientX: e.clientX,
      clientY: e.clientY,
    };
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const pending = pendingRef.current;
      if (!pending) return;
      const { card, clientX, clientY } = pending;
      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
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
    pendingRef.current = null;
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
