import Link from "next/link";
import { ChevronLeft } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-sm font-mono text-neon-cyan mb-3 tracking-widest uppercase">
          404 — Not Found
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
          页面去外太空了
        </h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          你访问的页面不存在，或者已经被搬到了别的星系。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-all font-mono text-sm"
        >
          <ChevronLeft width={14} height={14} />
          回到首页
        </Link>
      </div>
    </div>
  );
}
