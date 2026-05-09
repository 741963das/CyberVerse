"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/* ===== 导航数据 ===== */
const NAV_ITEMS = [
  { href: "/", label: "首页", icon: "⌂" },
  { href: "/chat", label: "AI 助手", icon: "◈" },
  { href: "/learn", label: "学习中心", icon: "◎" },
  { href: "/lab", label: "漏洞靶场", icon: "✦" },
  { href: "/tools", label: "工具中心", icon: "⟐" },
] as const;

/* ===== 页面标题映射 ===== */
const PAGE_TITLES: Record<string, string> = {
  "/": "HOME",
  "/chat": "AI-ASSISTANT",
  "/learn": "LEARNING-CENTER",
  "/lab": "VULN-LAB",
  "/tools": "SECURITY-TOOLKIT",
};

/* ===== 顶部状态栏 + 移动端菜单 ===== */
export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageTitle = PAGE_TITLES[pathname] || "CYBERVERSE";

  return (
    <>
      {/* ===== 桌面端顶部状态栏 ===== */}
      <header className="hidden md:flex fixed top-0 left-72 right-0 z-30 h-12 items-center justify-between px-6 bg-zinc-950/60 backdrop-blur-md border-b border-cyan-500/10">
        {/* 当前页面路径 */}
        <div className="font-mono text-xs text-zinc-500 tracking-wider flex items-center gap-2">
          <span className="text-cyan-700">$</span>
          <span className="text-cyan-400">{pageTitle}</span>
          <span className="animate-blink-cursor text-cyan-400">_</span>
        </div>

        {/* 右侧状态 */}
        <div className="flex items-center gap-4 font-mono text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-breathe" />
            <span>CONNECTED</span>
          </div>
          <div className="text-zinc-700">|</div>
          <div>LATENCY: 12ms</div>
          <div className="text-zinc-700">|</div>
          <div>ENC: AES-256</div>
        </div>
      </header>

      {/* ===== 移动端顶栏 ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-cyan-500/20">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="block">
            <h1 className="text-xl font-black text-cyan-400 tracking-wider">
              CYBERVERSE
            </h1>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition"
            aria-label="Toggle menu"
          >
            <span className="font-mono text-lg">
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>

        {/* 移动端下拉菜单 */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
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
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-breathe" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
