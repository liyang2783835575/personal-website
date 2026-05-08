import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "./useReducedMotion";

describe("useReducedMotion", () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false by default when prefers-reduced-motion is not set", () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when prefers-reduced-motion: reduce is active", () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates state when media query changes to reduce", () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === "change") {
          changeHandler = handler;
        }
      }),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate the media query changing to "reduce"
    if (changeHandler) {
      act(() => {
        changeHandler!({ matches: true } as MediaQueryListEvent);
      });
    }

    expect(result.current).toBe(true);
  });

  it("updates state when media query changes back to no-preference", () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === "change") {
          changeHandler = handler;
        }
      }),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);

    if (changeHandler) {
      act(() => {
        changeHandler!({ matches: false } as MediaQueryListEvent);
      });
    }

    expect(result.current).toBe(false);
  });

  it("removes event listener on unmount", () => {
    const removeEventListener = vi.fn();

    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener,
    });

    const { unmount } = renderHook(() => useReducedMotion());
    unmount();

    expect(removeEventListener).toHaveBeenCalledTimes(1);
    expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
