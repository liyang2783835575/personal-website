export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-text-muted">
          &copy; {new Date().getFullYear()} Li Yang. Built with Next.js &amp; Tailwind CSS.
        </p>
        <div className="flex items-center gap-1 text-xs font-mono text-text-muted">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          <span>System Online</span>
        </div>
      </div>
    </footer>
  );
}
