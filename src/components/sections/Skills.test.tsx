import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Skills from "./Skills";

// Mock useReducedMotion hook
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// Mock framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  useInView: () => true,
}));

describe("Skills", () => {
  it("renders the section heading", () => {
    render(<Skills />);
    expect(screen.getByText("技能")).toBeInTheDocument();
  });

  it("renders category labels from resume data", () => {
    render(<Skills />);
    expect(screen.getByText("前端")).toBeInTheDocument();
    expect(screen.getByText("后端")).toBeInTheDocument();
    expect(screen.getByText("工具")).toBeInTheDocument();
    expect(screen.getByText("其他")).toBeInTheDocument();
  });

  it("renders skill names from resume data", () => {
    render(<Skills />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React / Next.js")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Git")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("Cocos Creator")).toBeInTheDocument();
    expect(screen.getByText("AI / LLM 应用")).toBeInTheDocument();
  });

  it("renders the 3-tier labels (daily / proficient / familiar)", () => {
    render(<Skills />);
    // Each tier label appears once per non-empty category (4 categories → at least 1 of each)
    expect(screen.getAllByText("日常主力").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("熟练").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("了解").length).toBeGreaterThanOrEqual(1);
  });

  it("does NOT render numeric skill percentages", () => {
    render(<Skills />);
    // We moved away from "TypeScript 90%" style. No number-percent labels in DOM.
    expect(screen.queryByText("90%")).not.toBeInTheDocument();
    expect(screen.queryByText("65%")).not.toBeInTheDocument();
  });

  it("renders the section number prefix", () => {
    render(<Skills />);
    expect(screen.getByText("02.")).toBeInTheDocument();
  });

  it("renders skills grouped by category", () => {
    render(<Skills />);
    // Frontend category should contain frontend skills
    const frontendHeading = screen.getByText("前端");
    expect(frontendHeading).toBeInTheDocument();

    // Backend category should contain backend skills
    const backendHeading = screen.getByText("后端");
    expect(backendHeading).toBeInTheDocument();
  });
});
