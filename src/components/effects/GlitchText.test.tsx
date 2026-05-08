import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GlitchText from "./GlitchText";

describe("GlitchText", () => {
  it("renders the text prop", () => {
    render(<GlitchText text="Hello World" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders with default span tag", () => {
    render(<GlitchText text="Test" />);
    const element = screen.getByText("Test");
    expect(element.tagName.toLowerCase()).toBe("span");
  });

  it("renders with custom tag when specified", () => {
    render(<GlitchText text="Heading" as="h1" />);
    const element = screen.getByText("Heading");
    expect(element.tagName.toLowerCase()).toBe("h1");
  });

  it("renders with h2 tag", () => {
    render(<GlitchText text="Subheading" as="h2" />);
    const element = screen.getByText("Subheading");
    expect(element.tagName.toLowerCase()).toBe("h2");
  });

  it("renders with h3 tag", () => {
    render(<GlitchText text="Small heading" as="h3" />);
    const element = screen.getByText("Small heading");
    expect(element.tagName.toLowerCase()).toBe("h3");
  });

  it("applies the glitch class", () => {
    render(<GlitchText text="Classy" />);
    const element = screen.getByText("Classy");
    expect(element).toHaveClass("glitch");
  });

  it("applies custom className when provided", () => {
    render(<GlitchText text="Custom" className="my-class" />);
    const element = screen.getByText("Custom");
    expect(element).toHaveClass("glitch");
    expect(element).toHaveClass("my-class");
  });

  it("sets data-text attribute to the text prop", () => {
    render(<GlitchText text="DataAttr" />);
    const element = screen.getByText("DataAttr");
    expect(element).toHaveAttribute("data-text", "DataAttr");
  });

  it("renders empty string when text is empty", () => {
    render(<GlitchText text="" />);
    const element = screen.getByTestId("glitch-text");
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("data-text", "");
  });
});
