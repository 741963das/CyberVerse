"use client";

import ShellLayout from "@/components/Shell/layout";
import { useState, useEffect } from "react";
import Link from "next/link";

const LEARN_MODULES = [
  {
    id: "web-security",
    title: "Web 安全基础",
    desc: "SQL注入、XSS、CSRF 等 Web 常见漏洞原理与防御",
    level: "入门",
    lessons: 24,
    color: "cyan" as const,
    icon: "⬡",
  },
  {
    id: "network-security",
    title: "网络安全攻防",
    desc: "网络协议分析、防火墙、IDS/IPS 入侵检测技术",
    level: "进阶",
    lessons: 18,
    color: "danger" as const,
    icon: "◈",
  },
  {
    id: "crypto",
    title: "密码学与加密",
    desc: "对称/非对称加密、数字签名、PKI 体系详解",
    level: "进阶",
    lessons: 15,
    color: "matrix" as const,
    icon: "◉",
  },
  {
    id: "pentest",
    title: "渗透测试实战",
    desc: "信息收集、漏洞利用、后渗透全流程实战演练",
    level: "高级",
    lessons: 32,
    color: "danger" as const,
    icon: "▸",
  },
  {
    id: "reverse",
    title: "逆向工程",
    desc: "二进制分析、反汇编、脱壳与恶意软件分析",
    level: "高级",
    lessons: 20,
    color: "cyan" as const,
    icon: "⟐",
  },
  {
    id: "ai-security",
    title: "AI 安全前沿",
    desc: "对抗样本、模型窃取、Prompt注入等 AI 安全新领域",
    level: "前沿",
    lessons: 12,
    color: "matrix" as const,
    icon: "✦",
  },
];

const LEVEL_COLORS: Record<string, string> = {
  "入门": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "进阶": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  "高级": "bg-red-500/10 text-red-400 border-red-500/30",
  "前沿": "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const COLOR_MAP = {
  cyan: {
    border: "border-cyan-500/20 hover:border-cyan-400/50",
    glow: "hover:shadow-[0_0_30px_#00f0ff20]",
    icon: "text-cyan-400",
  },
  danger: {
    border: "border-red-500/20 hover:border-red-400/50",
    glow: "hover:shadow-[0_0_30px_#ff004020]",
    icon: "text-red-400",
  },
  matrix: {
    border: "border-green-500/20 hover:border-green-400/50",
    glow: "hover:shadow-[0_0_30px_#00ff4120]",
    icon: "text-green-400",
  },
};

export default function LearnPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ShellLayout>
      <div className="min-h-screen bg-black">
        {/* 顶部横幅 */}
        <div className="relative border-b border-cyan-500/15 bg-zinc-950/50 px-6 py-12">
          <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="font-mono text-xs text-cyan-500/60 tracking-[0.3em] mb-3">
              [ LEARNING CENTER ]
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              学习<span className="text-cyan-400">中心</span>
            </h1>
            <p className="mt-3 text-zinc-500 text-sm max-w-lg">
              系统化的网络安全课程体系，从入门到专家，AI 全程陪伴学习。
            </p>
            <div className="mt-4 w-24 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
          </div>
        </div>

        {/* 课程列表 */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LEARN_MODULES.map((mod) => {
              const colors = COLOR_MAP[mod.color];
              return (
                <div
                  key={mod.id}
                  className={`
                    cyber-card rounded-xl p-5 cursor-pointer
                    ${colors.border} ${colors.glow}
                    transition-all duration-300
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl ${colors.icon}`}>{mod.icon}</span>
                      <div>
                        <h3 className="font-bold tracking-wide">{mod.title}</h3>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 border rounded ${LEVEL_COLORS[mod.level]}`}>
                          {mod.level}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-zinc-600">
                      {mod.lessons} 课时
                    </span>
                  </div>
                  <p className="mt-3 text-zinc-500 text-sm leading-relaxed">
                    {mod.desc}
                  </p>
                  <div className={`mt-4 font-mono text-xs ${colors.icon} flex items-center gap-1`}>
                    <span>START LEARNING</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 学习路线概览 */}
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="border border-cyan-500/10 rounded-xl p-6 bg-cyan-500/[0.02]">
            <h2 className="text-lg font-bold mb-4">
              推荐学习<span className="text-cyan-400">路线</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 font-mono text-sm">
              {["Web安全基础", "→", "网络安全攻防", "→", "渗透测试实战", "→", "AI安全前沿"].map(
                (step, i) =>
                  step === "→" ? (
                    <span key={i} className="text-cyan-500/40 hidden sm:inline px-2">
                      →
                    </span>
                  ) : (
                    <span
                      key={i}
                      className="border border-cyan-500/20 rounded px-3 py-1.5 text-zinc-400 text-xs"
                    >
                      {step}
                    </span>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
