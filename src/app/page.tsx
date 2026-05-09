"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

/* ===== 矩阵雨背景组件 ===== */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>{}[]アイウエオカキクケコ";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00f0ff15";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
    />
  );
}

/* ===== 打字机效果 ===== */
function TypewriterText({ text, delay = 80 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-blink-cursor text-cyan-400">|</span>}
    </span>
  );
}

/* ===== 粒子网格 ===== */
function ParticleGrid() {
  return (
    <div className="absolute inset-0 grid-bg pointer-events-none" />
  );
}

/* ===== 横向扫描光 ===== */
function ScanBeam() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 w-[30%] h-full bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-h-scan" />
    </div>
  );
}

/* ===== 入口卡片数据 ===== */
const ENTRY_CARDS = [
  {
    title: "AI 安全助手",
    desc: "AI驱动的安全知识对话，实时解答你的网络安全疑问",
    href: "/chat",
    icon: "◈",
    tag: "AI-CHAT",
    color: "cyan" as const,
  },
  {
    title: "漏洞靶场",
    desc: "真实漏洞环境实战演练，从SQL注入到XSS全覆盖",
    href: "/lab",
    icon: "✦",
    tag: "LAB",
    color: "danger" as const,
  },
  {
    title: "学习路线",
    desc: "从零基础到安全专家，系统化成长路径指引",
    href: "/learn",
    icon: "◎",
    tag: "PATH",
    color: "matrix" as const,
  },
];

const COLOR_MAP = {
  cyan: {
    border: "border-cyan-500/30 hover:border-cyan-400/60",
    glow: "hover:shadow-[0_0_40px_#00f0ff25]",
    tag: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    icon: "text-cyan-400",
    line: "from-cyan-500/60 via-cyan-500/20 to-transparent",
  },
  danger: {
    border: "border-red-500/30 hover:border-red-400/60",
    glow: "hover:shadow-[0_0_40px_#ff004025]",
    tag: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: "text-red-400",
    line: "from-red-500/60 via-red-500/20 to-transparent",
  },
  matrix: {
    border: "border-green-500/30 hover:border-green-400/60",
    glow: "hover:shadow-[0_0_40px_#00ff4125]",
    tag: "bg-green-500/10 text-green-400 border-green-500/30",
    icon: "text-green-400",
    line: "from-green-500/60 via-green-500/20 to-transparent",
  },
};

/* ===== 统计数据 ===== */
const STATS = [
  { value: "2,847", label: "安全课程" },
  { value: "156", label: "漏洞靶场" },
  { value: "12K+", label: "活跃学员" },
  { value: "99.7%", label: "好评率" },
];

/* ===== 首页主组件 ===== */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
        {/* ===== 动态背景层 ===== */}
        <MatrixRain />
        <ParticleGrid />
        <ScanBeam />

        {/* ===== Hero 区域 ===== */}
        <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
          {/* 顶部装饰线 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          {/* 系统标识 */}
          <div className="font-mono text-xs text-zinc-600 tracking-[0.3em] mb-6 animate-fade-in-up">
            [ SYSTEM INITIALIZED ]
          </div>

          {/* 主标题 */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-center">
            <span className="text-cyan-400 animate-glitch-color">
              CYBER
            </span>
            <span className="text-white">VERSE</span>
          </h1>

          {/* 副标题打字机 */}
          <div className="mt-6 text-lg sm:text-xl md:text-2xl font-mono text-zinc-400 text-center">
            <TypewriterText text="AI 驱动的网络安全学习平台" delay={100} />
          </div>

          {/* 分隔线 */}
          <div className="mt-8 w-48 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          {/* 描述 */}
          <p className="mt-6 max-w-xl text-center text-zinc-500 text-sm sm:text-base leading-relaxed">
            掌握赛博世界的核心技能。从漏洞挖掘到安全防御，
            <span className="text-cyan-400">AI</span> 为你导航每一步成长。
          </p>

          {/* CTA 按钮 */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/chat">
              <button className="cyber-btn cyber-btn-primary rounded-lg text-sm sm:text-base">
                <span>启动 AI 助手</span>
              </button>
            </Link>
            <Link href="/learn">
              <button className="cyber-btn rounded-lg text-sm sm:text-base">
                <span>探索课程</span>
              </button>
            </Link>
          </div>

          {/* 终端装饰 */}
          <div className="mt-16 w-full max-w-2xl mx-auto">
            <div className="border border-cyan-500/15 rounded-lg bg-black/60 backdrop-blur-sm overflow-hidden">
              {/* 终端头 */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-cyan-500/10 bg-zinc-950">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-2 font-mono text-xs text-zinc-600">cyberverse@terminal</span>
              </div>
              {/* 终端内容 */}
              <div className="p-4 font-mono text-xs sm:text-sm space-y-1.5 text-zinc-500">
                <div>
                  <span className="text-cyan-500">$</span> nmap -sV --script vuln target.cyberverse.ai
                </div>
                <div className="text-green-500/70">[*] Scanning target...</div>
                <div className="text-green-500/70">[*] Detected 3 open ports: 22, 80, 443</div>
                <div className="text-yellow-500/70">[!] CVE-2024-XXXX detected on port 80</div>
                <div className="text-cyan-400">[+] Vulnerability assessment complete</div>
                <div className="flex items-center mt-1">
                  <span className="text-cyan-500">$</span>
                  <span className="ml-1 animate-blink-cursor text-cyan-400">_</span>
                </div>
              </div>
            </div>
          </div>

          {/* 向下指示 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-breathe">
            <div className="w-5 h-8 border border-cyan-500/40 rounded-full flex justify-center pt-1.5">
              <div className="w-1 h-2 bg-cyan-400/60 rounded-full" />
            </div>
          </div>
        </section>

        {/* ===== 入口卡片区 ===== */}
        <section className="relative z-10 px-6 pb-20">
          {/* 区域标题 */}
          <div className="max-w-5xl mx-auto mb-12 text-center">
            <div className="font-mono text-xs text-cyan-500/60 tracking-[0.3em] mb-3">
              [ ACCESS MODULES ]
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              核心<span className="text-cyan-400">功能</span>入口
            </h2>
            <div className="mt-4 w-24 h-px mx-auto bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>

          {/* 卡片网格 */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {ENTRY_CARDS.map((card, index) => {
              const colors = COLOR_MAP[card.color];
              return (
                <Link key={card.title} href={card.href}>
                  <div
                    className={`
                      cyber-card rounded-xl p-6 h-full
                      ${colors.border} ${colors.glow}
                      transition-all duration-300 cursor-pointer
                    `}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {/* 卡片头部 */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-3xl ${colors.icon}`}>{card.icon}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 border rounded ${colors.tag}`}>
                        {card.tag}
                      </span>
                    </div>

                    {/* 分隔线 */}
                    <div className={`h-px w-full bg-gradient-to-r ${colors.line} mb-4`} />

                    {/* 标题 */}
                    <h3 className="text-lg font-bold tracking-wide mb-2">
                      {card.title}
                    </h3>

                    {/* 描述 */}
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      {card.desc}
                    </p>

                    {/* 底部箭头 */}
                    <div className={`mt-6 font-mono text-xs ${colors.icon} flex items-center gap-1`}>
                      <span>ACCESS</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ===== 统计数据区 ===== */}
        <section className="relative z-10 px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 border border-cyan-500/10 rounded-lg bg-cyan-500/[0.02]"
                >
                  <div className="text-2xl sm:text-3xl font-black text-cyan-400">
                    {stat.value}
                  </div>
                  <div className="text-zinc-500 text-xs mt-1 font-mono tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 底部 ===== */}
        <footer className="relative z-10 border-t border-cyan-500/10 px-6 py-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-xs text-zinc-600">
              © 2025 CyberVerse AI — All systems operational
            </div>
            <div className="flex items-center gap-1 font-mono text-xs text-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-breathe" />
              <span>UPTIME: 99.97%</span>
            </div>
          </div>
        </footer>
      </div>
  );
}
