export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="relative">
        {/* Outer ring */}
        <div
          className="w-16 h-16 border-2 border-neon-cyan/30 rounded-full
                     animate-ping absolute inset-0"
          style={{ animationDuration: "2s" }}
        />

        {/* Middle ring */}
        <div
          className="w-16 h-16 border border-neon-pink/50 rounded-full
                     animate-spin"
          style={{
            animationDuration: "1.5s",
            animationDirection: "reverse",
          }}
        />

        {/* Inner core */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-3 h-3 bg-neon-cyan rounded-full animate-pulse"
          />
        </div>
      </div>

      <div className="ml-6 font-mono text-sm text-text-secondary/70 tracking-wider">
        <span className="animate-pulse">LOADING</span>
        <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
          .
        </span>
        <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
          .
        </span>
        <span className="animate-bounce" style={{ animationDelay: "0.6s" }}>
          .
        </span>
      </div>
    </div>
  );
}