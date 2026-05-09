"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

/* ===== 页面加载遮罩 ===== */
function PageLoader({ loading }: { loading: boolean }) {
  return (
    <div
      className={`
        fixed inset-0 z-[9998] bg-black flex items-center justify-center
        transition-opacity duration-500 pointer-events-none
        ${loading ? "opacity-100" : "opacity-0"}
      `}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <div className="font-mono text-xs text-cyan-500/60 tracking-[0.3em]">
          LOADING...
        </div>
      </div>
    </div>
  );
}

/* ===== 全局 Shell 布局 ===== */
export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [pageKey, setPageKey] = useState(pathname);

  /* 路由切换时触发加载动画 */
  useEffect(() => {
    if (pageKey !== pathname) {
      setLoading(true);
      const timer = setTimeout(() => {
        setPageKey(pathname);
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [pathname, pageKey]);

  return (
    <main className="min-h-screen bg-black text-white flex relative">
      {/* 扫描线叠加 */}
      <div className="scanline-overlay" />

      {/* 页面加载遮罩 */}
      <PageLoader loading={loading} />

      {/* 桌面端侧边栏 */}
      <Sidebar />

      {/* 顶部状态栏 + 移动端菜单 */}
      <Header />

      {/* 页面内容区 */}
      <section className="flex-1 overflow-auto md:ml-72 mt-14 md:mt-12">
        <div
          key={pageKey}
          className="page-enter-animation"
        >
          {children}
        </div>
      </section>
    </main>
  );
}
