import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActiveSection } from "./useActiveSection";

describe("useActiveSection", () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let unobserveMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let capturedCallback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    observeMock = vi.fn();
    unobserveMock = vi.fn();
    disconnectMock = vi.fn();
    capturedCallback = null;

    class MockIntersectionObserver {
      root = null;
      rootMargin = "";
      thresholds = [0.5];
      constructor(cb: IntersectionObserverCallback) {
        capturedCallback = cb;
      }
      observe = observeMock;
      unobserve = unobserveMock;
      disconnect = disconnectMock;
      takeRecords = vi.fn(() => []);
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockGetElementById(ids: Record<string, HTMLElement | null>) {
    vi.spyOn(document, "getElementById").mockImplementation(
      (id: string) => ids[id] ?? null,
    );
  }

  it("defaults to the first section ID", () => {
    mockGetElementById({
      intro: document.createElement("div"),
      about: document.createElement("div"),
    });

    const { result } = renderHook(() =>
      useActiveSection(["intro", "about"]),
    );

    expect(result.current.activeId).toBe("intro");
  });

  it("observes each section element", () => {
    const intro = document.createElement("div");
    const about = document.createElement("div");
    mockGetElementById({ intro, about });

    renderHook(() => useActiveSection(["intro", "about"]));

    expect(observeMock).toHaveBeenCalledTimes(2);
    expect(observeMock).toHaveBeenCalledWith(intro);
    expect(observeMock).toHaveBeenCalledWith(about);
  });

  it("creates IntersectionObserver with threshold 0.5", () => {
    mockGetElementById({ intro: document.createElement("div") });

    renderHook(() => useActiveSection(["intro"]));

    // If the constructor ran, capturedCallback was assigned
    expect(capturedCallback).not.toBeNull();
    // Observer was told to observe the element
    expect(observeMock).toHaveBeenCalledTimes(1);
  });

  it("updates activeId when a section becomes intersecting", () => {
    const intro = document.createElement("div");
    const about = document.createElement("div");
    mockGetElementById({ intro, about });

    const { result } = renderHook(() =>
      useActiveSection(["intro", "about"]),
    );
    expect(result.current.activeId).toBe("intro");

    // Simulate "about" becoming visible
    const callback = capturedCallback!;
    act(() => {
      callback(
        [
          { target: about, isIntersecting: true } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });

    expect(result.current.activeId).toBe("about");
  });

  it("updates activeId when a section stops intersecting and another is visible", () => {
    const intro = document.createElement("div");
    const about = document.createElement("div");
    mockGetElementById({ intro, about });

    const { result } = renderHook(() =>
      useActiveSection(["intro", "about"]),
    );

    const callback = capturedCallback!;

    // intro leaves, about enters
    act(() => {
      callback(
        [
          { target: intro, isIntersecting: false } as IntersectionObserverEntry,
          { target: about, isIntersecting: true } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });

    expect(result.current.activeId).toBe("about");
  });

  it("skips elements that are not found in the DOM", () => {
    const about = document.createElement("div");
    // "intro" returns null, "about" returns an element
    mockGetElementById({ intro: null, about });

    const { result } = renderHook(() =>
      useActiveSection(["intro", "about"]),
    );

    // Default is still first ID even if element missing
    expect(result.current.activeId).toBe("intro");
    // Only "about" was observed
    expect(observeMock).toHaveBeenCalledTimes(1);
    expect(observeMock).toHaveBeenCalledWith(about);
  });

  it("disconnects observer on unmount", () => {
    mockGetElementById({ intro: document.createElement("div") });

    const { unmount } = renderHook(() =>
      useActiveSection(["intro"]),
    );
    unmount();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it("handles an empty sectionIds array", () => {
    const { result } = renderHook(() => useActiveSection([]));

    expect(result.current.activeId).toBe("");
    expect(observeMock).not.toHaveBeenCalled();
  });
});
