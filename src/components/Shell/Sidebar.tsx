"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ===== 导航数据 ===== */
const NAV_ITEMS = [
  { href: "/", label: "首页", icon: "⌂", shortLabel: "HOME" },
  { href: "/chat", label: "AI 助手", icon: "◈", shortLabel: "CHAT" },
  { href: "/learn", label: "学习中心", icon: "◎", shortLabel: "LEARN" },
  { href: "/lab", label: "漏洞靶场", icon: "✦", shortLabel: "LAB" },
] as const;

/* ===== 侧边栏组件 ===== */
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-72 border-r border-cyan-500/20 bg-zinc-950/80 backdrop-blur-md p-6 flex-col fixed left-0 top-0 bottom-0 z-40">
      {/* Logo 区域 */}
      <div className="relative">
        <Link href="/" className="block group">
          <h1 className="text-3xl font-black text-cyan-400 tracking-wider animate-glitch-color group-hover:text-cyan-300 transition-colors">
            CYBERVERSE
          </h1>
        </Link>
        <div className="h-px w-full bg-gradient-to-r from-cyan-500/60 via-cyan-500/20 to-transparent mt-3" />
        <p className="text-zinc-500 mt-2 text-xs font-mono tracking-widest">
          AI 网络安全学习平台
        </p>
      </div>

      {/* 系统状态指示 */}
      <div className="mt-6 p-3 border border-cyan-500/10 bg-cyan-500/5 rounded-lg font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-breathe" />
          <span className="text-cyan-400">SYSTEM ONLINE</span>
        </div>
        <div className="text-zinc-600 mt-1">
          SEC_LEVEL: <span className="text-cyan-500">CLASSIFIED</span>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="mt-8 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  w-full py-3 px-4 rounded-lg font-bold tracking-wide
                  flex items-center gap-3 transition-all duration-300
                  ${
                    isActive
                      ? "bg-cyan-400/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_#00f0ff20]"
                      : "border border-transparent text-zinc-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/20"
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-breathe" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 底部终端装饰 */}
      <div className="mt-auto">
        <div className="h-px w-full bg-gradient-to-r from-cyan-500/30 via-cyan-500/10 to-transparent mb-4" />
        <div className="font-mono text-xs space-y-1">
          <div className="text-zinc-600">
            <span className="text-cyan-700">$</span> status --version
          </div>
          <div className="text-zinc-500">
            CyberVerse AI v1.0.0
          </div>
          <div className="text-zinc-700 mt-2">
            &copy; 2025 CyberVerse
          </div>
        </div>
      </div>
    </aside>
  );
}
