import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ScrollProgress from "./ScrollProgress";

const SECTIONS = [
  { id: "hero", label: "首页" },
  { id: "skills", label: "技能" },
  { id: "projects", label: "项目" },
];

let scrollIntoViewMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollIntoViewMock = vi.fn();
  HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
  document.body.innerHTML = "";
});

describe("ScrollProgress", () => {
  it("renders all section labels", () => {
    render(<ScrollProgress sections={SECTIONS} activeId="hero" />);

    for (const section of SECTIONS) {
      expect(screen.getByText(section.label)).toBeInTheDocument();
    }
  });

  it("applies neon-cyan styling to the active section dot", () => {
    render(<ScrollProgress sections={SECTIONS} activeId="skills" />);

    const dots = document.querySelectorAll('[data-testid^="dot-"]');
    const activeDot = document.querySelector('[data-testid="dot-skills"]');

    expect(activeDot).toHaveClass("bg-neon-cyan");
  });

  it("applies muted styling to inactive section dots", () => {
    render(<ScrollProgress sections={SECTIONS} activeId="skills" />);

    const inactiveDot = document.querySelector('[data-testid="dot-hero"]');
    expect(inactiveDot).toHaveClass("bg-text-muted");
  });

  it("scrolls to the section when a dot is clicked", () => {
    // Create a target element so getElementById finds it
    const target = document.createElement("div");
    target.id = "projects";
    document.body.appendChild(target);

    render(<ScrollProgress sections={SECTIONS} activeId="hero" />);

    const dot = document.querySelector('[data-testid="dot-projects"]');
    fireEvent.click(dot!);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("renders nothing when sections is empty", () => {
    const { container } = render(
      <ScrollProgress sections={[]} activeId="" />
    );

    const dots = container.querySelectorAll('[data-testid^="dot-"]');
    expect(dots).toHaveLength(0);
  });
});
