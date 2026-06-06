/**
 * Shared SVG icons.
 *
 * One source of truth for icons that appear in 2+ places. All icons use
 * `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"`, and
 * `strokeWidth="2"` so a caller's `text-*` class controls the color
 * (e.g. `<ChevronLeft className="text-neon-cyan" />`).
 *
 * Single-use icons stay inline in their component — extracting them
 * here would just add an indirection without a deduplication payoff.
 */

import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "fill" | "stroke" | "strokeWidth">;

/** A baseline `<svg>` element. Callers pass width/height/className. */
function Svg({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Back / left arrow used in "返回" buttons. */
export function ChevronLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

/** Trash / delete icon for history rows. */
export function Trash(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </Svg>
  );
}

/** Warning triangle used in error banners. */
export function AlertTriangle(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Svg>
  );
}
