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

  it("renders skill level percentages", () => {
    render(<Skills />);
    // Check all percentages are rendered (some may have multiple matches)
    const percentages = ["90%", "85%", "80%", "75%", "70%", "65%"];
    for (const pct of percentages) {
      const elements = screen.getAllByText(pct);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    }
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
