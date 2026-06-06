"use client";

import { useState, useEffect } from "react";

export function useActiveSection(
  sectionIds: readonly string[],
): { activeId: string } {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    // Pre-build the (id → element) map once. Reused by the IO callback
    // below so we never call document.getElementById on every tick.
    const idToElement = new Map<string, HTMLElement>();
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) idToElement.set(id, el);
    }

    const elementToId = new Map<HTMLElement, string>();
    for (const [id, el] of idToElement) elementToId.set(el, id);

    if (elementToId.size === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const last = visible[visible.length - 1];
          const matchedId = elementToId.get(last.target as HTMLElement);
          if (matchedId) setActiveId(matchedId);
        }
      },
      { threshold: 0.5 },
    );

    idToElement.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionIds]);

  return { activeId };
}
