"use client";

import { useState, useEffect } from "react";

export function useActiveSection(sectionIds: string[]): { activeId: string } {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const last = visible[visible.length - 1];
          const matchedId = sectionIds.find(
            (id) => last.target === document.getElementById(id),
          );
          if (matchedId) setActiveId(matchedId);
        }
      },
      { threshold: 0.5 },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionIds]);

  return { activeId };
}
