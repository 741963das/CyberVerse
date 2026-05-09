"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: "⌂" },
  { href: "/chat", label: "AI 助手", icon: "◈" },
  { href: "/learn", label: "学习中心", icon: "◎" },
] as const;

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white flex relative">
      {/* 扫描线叠加 */}
      <div className="scanline-overlay" />

      {/* ===== 桌面端侧边栏 ===== */}
      <aside className="hidden md:flex w-72 border-r border-cyan-500/20 bg-zinc-950/80 backdrop-blur-md p-6 flex-col fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="relative">
          <h1 className="text-3xl font-black text-cyan-400 tracking-wider animate-glitch-color">
            CYBERVERSE
          </h1>
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
              © 2025 CyberVerse
            </div>
          </div>
        </div>
      </aside>

      {/* ===== 移动端顶栏 ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-black text-cyan-400 tracking-wider">
            CYBERVERSE
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition"
          >
            <span className="font-mono text-lg">
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>

        {/* 移动端下拉菜单 */}
        {mobileMenuOpen && (
          <nav className="border-t border-cyan-500/10 bg-zinc-950/98 backdrop-blur-md p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`
                      w-full py-3 px-4 rounded-lg font-bold tracking-wide
                      flex items-center gap-3 transition-all
                      ${
                        isActive
                          ? "bg-cyan-400/15 text-cyan-400 border border-cyan-500/30"
                          : "text-zinc-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* ===== 页面内容 ===== */}
      <section className="flex-1 overflow-auto md:ml-72 mt-14 md:mt-0">
        {children}
      </section>
    </main>
  );
}
