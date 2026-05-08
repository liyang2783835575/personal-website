import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Contact from "./Contact";

// Mock framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  useInView: () => true,
}));

describe("Contact", () => {
  it("renders the section heading", () => {
    render(<Contact />);
    expect(screen.getByText("联系我")).toBeInTheDocument();
  });

  it("renders the email link with correct mailto href", () => {
    render(<Contact />);
    const emailLink = screen.getByText("发送邮件").closest("a");
    expect(emailLink).toHaveAttribute("href", "mailto:liyang@example.com");
  });

  it("renders the GitHub link with correct href", () => {
    render(<Contact />);
    const githubLink = screen.getByText("GitHub").closest("a");
    expect(githubLink).toHaveAttribute("href", "https://github.com/liyang");
  });

  it("renders the GitHub link with target and rel attributes", () => {
    render(<Contact />);
    const githubLink = screen.getByText("GitHub").closest("a");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the section label", () => {
    render(<Contact />);
    expect(screen.getByText("Get In Touch")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<Contact />);
    expect(
      screen.getByText(/如果你有项目合作、技术交流/)
    ).toBeInTheDocument();
  });

  it("has the contact section id", () => {
    render(<Contact />);
    const section = document.getElementById("contact");
    expect(section).toBeInTheDocument();
  });
});
