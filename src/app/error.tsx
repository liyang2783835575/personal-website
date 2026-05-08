"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          {/* Glitch effect container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8rem] font-bold text-neon-cyan/10 select-none">
              404
            </span>
          </div>

          {/* Main error icon */}
          <div className="relative z-10 flex justify-center">
            <svg
              className="w-24 h-24 text-neon-pink animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-mono font-bold tracking-tight">
            <span className="text-neon-pink">ERROR_</span>
            <span className="text-neon-cyan">DETECTED</span>
          </h1>

          <p className="text-text-secondary font-mono text-sm">
            {error.digest ? (
              <>ERR_{error.digest.toUpperCase().slice(0, 8)}</>
            ) : (
              "SYSTEM_FAILURE"
            )}
          </p>

          <p className="text-text-secondary/80 text-sm max-w-sm mx-auto">
            An unexpected error has occurred. The system has logged this incident
            for analysis.
          </p>
        </div>

        <button
          onClick={reset}
          className="group relative px-6 py-3 font-mono text-sm tracking-wider
                     bg-transparent border border-neon-cyan text-neon-cyan
                     hover:bg-neon-cyan/10 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]
                     transition-all duration-300 cursor-pointer"
        >
          <span className="relative z-10">[ RETRY_SYSTEM ]</span>
          <div className="absolute inset-0 bg-neon-cyan/5 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        <p className="text-text-secondary/50 text-xs font-mono">
          If the problem persists, contact the system administrator.
        </p>
      </div>
    </div>
  );
}