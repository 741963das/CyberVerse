"use client";

import Link from "next/link";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-white flex">
      
      {/* 左侧导航 */}
      <aside className="w-72 border-r border-cyan-500/20 bg-zinc-950 p-6 flex flex-col">
        
        <h1 className="text-4xl font-black text-cyan-400">
          CYBERVERSE
        </h1>

        <p className="text-zinc-500 mt-2 text-sm">
          AI 网络安全学习平台
        </p>

        <div className="mt-10 space-y-4">
          
          <Link href="/">
            <button className="w-full bg-cyan-400 text-black py-3 rounded-2xl font-bold hover:scale-105 transition">
              首页
            </button>
          </Link>

          <Link href="/chat">
            <button className="w-full border border-cyan-500/30 py-3 rounded-2xl hover:bg-cyan-500/10 transition">
              AI 助手
            </button>
          </Link>

          <Link href="/learn">
            <button className="w-full border border-cyan-500/30 py-3 rounded-2xl hover:bg-cyan-500/10 transition">
              学习中心
            </button>
          </Link>

        </div>

        <div className="mt-auto text-zinc-600 text-xs">
          CyberVerse AI v1.0
        </div>

      </aside>

      {/* 页面内容 */}
      <section className="flex-1 overflow-auto">
        {children}
      </section>

    </main>
  );
}