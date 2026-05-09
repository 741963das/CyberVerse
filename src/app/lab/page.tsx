"use client";

import { useState, useEffect, useMemo } from "react";
import TerminalSimulator from "@/components/lab/TerminalSimulator";
import AttackChainFlow from "@/components/lab/AttackChainFlow";
import StatusPanel from "@/components/lab/StatusPanel";

/* ======================================================================
   数据层
   ====================================================================== */

interface VulnLab {
  id: string;
  title: string;
  desc: string;
  category: string;
  difficulty: "初级" | "中级" | "高级" | "专家";
  attackType: string;
  learners: number;
  completionRate: number;
  tags: string[];
  color: "cyan" | "danger" | "matrix" | "purple" | "warn";
  icon: string;
  online: number;
  cveId?: string;
  aiRisk: "低" | "中" | "高" | "极高";
}

interface VulnRankItem {
  rank: number;
  name: string;
  cve: string;
  severity: "critical" | "high" | "medium";
  exploits: number;
  trend: "up" | "down" | "stable";
}

interface CveSimulation {
  id: string;
  cveId: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  cvss: number;
  status: "active" | "coming" | "offline";
}

/* ---------- 靶场列表 ---------- */
const VULN_LABS: VulnLab[] = [
  {
    id: "sqli",
    title: "SQL Injection",
    desc: "从 Union 注入到盲注，覆盖 MySQL / PostgreSQL / MSSQL 全场景实战",
    category: "SQL 注入",
    difficulty: "中级",
    attackType: "注入攻击",
    learners: 3842,
    completionRate: 62,
    tags: ["Union", "Blind", "Error", "Time-Based"],
    color: "danger",
    icon: "◈",
    online: 47,
    cveId: "CVE-2024-*",
    aiRisk: "极高",
  },
  {
    id: "xss",
    title: "XSS Attack",
    desc: "反射型、存储型、DOM 型 XSS 漏洞利用与 CSP 绕过实战",
    category: "XSS",
    difficulty: "初级",
    attackType: "客户端攻击",
    learners: 4210,
    completionRate: 74,
    tags: ["Reflected", "Stored", "DOM", "CSP"],
    color: "cyan",
    icon: "⬡",
    online: 63,
    aiRisk: "高",
  },
  {
    id: "upload",
    title: "File Upload",
    desc: "绕过后缀检测、MIME 验证、内容检测，实现 Webshell 上传",
    category: "文件上传",
    difficulty: "中级",
    attackType: "上传绕过",
    learners: 2156,
    completionRate: 48,
    tags: ["Bypass", "Webshell", "MIME", "WAF"],
    color: "warn",
    icon: "▸",
    online: 31,
    aiRisk: "高",
  },
  {
    id: "rce",
    title: "Command Execution",
    desc: "OS 命令注入、代码执行漏洞利用与沙箱逃逸技术",
    category: "命令执行",
    difficulty: "高级",
    attackType: "执行攻击",
    learners: 1890,
    completionRate: 35,
    tags: ["RCE", "CodeExec", "Sandbox", "Pipe"],
    color: "danger",
    icon: "◉",
    online: 28,
    cveId: "CVE-2024-*",
    aiRisk: "极高",
  },
  {
    id: "ssrf",
    title: "SSRF",
    desc: "服务端请求伪造、内网探测与云元数据窃取实战",
    category: "SSRF",
    difficulty: "高级",
    attackType: "请求伪造",
    learners: 1240,
    completionRate: 29,
    tags: ["Internal", "Cloud", "Redirect", "DNS"],
    color: "purple",
    icon: "◎",
    online: 19,
    aiRisk: "中",
  },
  {
    id: "cve-sim",
    title: "CVE Simulation",
    desc: "Log4Shell / Spring4Shell / XZ Backdoor 真实漏洞复现",
    category: "CVE 模拟",
    difficulty: "专家",
    attackType: "综合攻击",
    learners: 980,
    completionRate: 18,
    tags: ["Log4Shell", "Spring4Shell", "XZ", "Zero-Day"],
    color: "danger",
    icon: "✦",
    online: 15,
    cveId: "CVE-2024-*",
    aiRisk: "极高",
  },
];

/* ---------- 热门漏洞排行 ---------- */
const VULN_RANK: VulnRankItem[] = [
  { rank: 1, name: "Log4Shell", cve: "CVE-2021-44228", severity: "critical", exploits: 12840, trend: "stable" },
  { rank: 2, name: "Spring4Shell", cve: "CVE-2022-22965", severity: "critical", exploits: 8920, trend: "down" },
  { rank: 3, name: "ProxyShell", cve: "CVE-2021-34473", severity: "critical", exploits: 7650, trend: "down" },
  { rank: 4, name: "Text4Shell", cve: "CVE-2022-42889", severity: "high", exploits: 5430, trend: "up" },
  { rank: 5, name: "HTTP/2 Rapid Reset", cve: "CVE-2023-44487", severity: "high", exploits: 4210, trend: "up" },
];

/* ---------- CVE 模拟 ---------- */
const CVE_SIMULATIONS: CveSimulation[] = [
  { id: "c1", cveId: "CVE-2021-44228", title: "Log4j JNDI 远程代码执行", severity: "critical", cvss: 10.0, status: "active" },
  { id: "c2", cveId: "CVE-2022-22965", title: "Spring RCE 注入", severity: "critical", cvss: 9.8, status: "active" },
  { id: "c3", cveId: "CVE-2023-44487", title: "HTTP/2 DDoS Rapid Reset", severity: "high", cvss: 7.5, status: "active" },
  { id: "c4", cveId: "CVE-2024-3094", title: "XZ Utils 后门植入", severity: "critical", cvss: 10.0, status: "coming" },
  { id: "c5", cveId: "CVE-2024-21762", title: "FortiOS Out-of-Bound Write", severity: "critical", cvss: 9.6, status: "active" },
];

/* ======================================================================
   样式映射
   ====================================================================== */

const DIFFICULTY_COLORS: Record<string, string> = {
  "初级": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "中级": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  "高级": "bg-red-500/10 text-red-400 border-red-500/30",
  "专家": "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const AI_RISK_COLORS: Record<string, string> = {
  "低": "bg-green-500/10 text-green-400 border-green-500/30",
  "中": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  "高": "bg-orange-500/10 text-orange-400 border-orange-500/30",
  "极高": "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse",
};

const COLOR_MAP = {
  cyan: {
    border: "border-cyan-500/20 hover:border-cyan-400/50",
    glow: "hover:shadow-[0_0_30px_#00f0ff20,inset_0_0_30px_#00f0ff08]",
    icon: "text-cyan-400",
    bar: "bg-cyan-400",
    barBg: "bg-cyan-500/10",
    tag: "bg-cyan-500/5 text-cyan-500/70 border-cyan-500/15",
    btn: "border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400/60",
  },
  danger: {
    border: "border-red-500/20 hover:border-red-400/50",
    glow: "hover:shadow-[0_0_30px_#ff004020,inset_0_0_30px_#ff004008]",
    icon: "text-red-400",
    bar: "bg-red-400",
    barBg: "bg-red-500/10",
    tag: "bg-red-500/5 text-red-500/70 border-red-500/15",
    btn: "border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-400/60",
  },
  matrix: {
    border: "border-green-500/20 hover:border-green-400/50",
    glow: "hover:shadow-[0_0_30px_#00ff4120,inset_0_0_30px_#00ff4108]",
    icon: "text-green-400",
    bar: "bg-green-400",
    barBg: "bg-green-500/10",
    tag: "bg-green-500/5 text-green-500/70 border-green-500/15",
    btn: "border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-400/60",
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-400/50",
    glow: "hover:shadow-[0_0_30px_#a855f720,inset_0_0_30px_#a855f708]",
    icon: "text-purple-400",
    bar: "bg-purple-400",
    barBg: "bg-purple-500/10",
    tag: "bg-purple-500/5 text-purple-500/70 border-purple-500/15",
    btn: "border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400/60",
  },
  warn: {
    border: "border-yellow-500/20 hover:border-yellow-400/50",
    glow: "hover:shadow-[0_0_30px_#ffb80020,inset_0_0_30px_#ffb80008]",
    icon: "text-yellow-400",
    bar: "bg-yellow-400",
    barBg: "bg-yellow-500/10",
    tag: "bg-yellow-500/5 text-yellow-500/70 border-yellow-500/15",
    btn: "border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400/60",
  },
};

const SEVERITY_STYLES: Record<string, { color: string; label: string }> = {
  critical: { color: "bg-red-500/10 text-red-400 border-red-500/30", label: "CRITICAL" },
  high: { color: "bg-orange-500/10 text-orange-400 border-orange-500/30", label: "HIGH" },
  medium: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", label: "MEDIUM" },
  low: { color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", label: "LOW" },
};

const TREND_ICONS: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

/* ======================================================================
   子组件
   ====================================================================== */

/* ---------- 扫描背景 ---------- */
function ScanBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-0 w-[30%] h-full bg-gradient-to-r from-transparent via-red-500/[0.02] to-transparent animate-h-scan" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
    </div>
  );
}

/* ---------- 进度条 ---------- */
function ProgressBar({ value, barClass, bgClass }: { value: number; barClass: string; bgClass: string }) {
  return (
    <div className={`w-full h-1.5 rounded-full ${bgClass} overflow-hidden`}>
      <div className={`h-full rounded-full ${barClass} transition-all duration-700 ease-out`} style={{ width: `${value}%` }} />
    </div>
  );
}

/* ---------- 在线人数指示器 ---------- */
function OnlineBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
      </span>
      <span className="font-mono text-[10px] text-green-400/80">{count} ONLINE</span>
    </div>
  );
}

/* ---------- 靶场卡片 ---------- */
function LabCard({ lab, onEnter }: { lab: VulnLab; onEnter: (lab: VulnLab) => void }) {
  const colors = COLOR_MAP[lab.color];
  return (
    <div
      className={`
        cyber-card rounded-xl p-5 cursor-pointer group
        ${colors.border} ${colors.glow}
        transition-all duration-300
        page-enter-animation
      `}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg border border-current/20 flex items-center justify-center text-2xl ${colors.icon} group-hover:scale-110 transition-transform duration-300`}>
            {lab.icon}
          </div>
          <div>
            <h3 className="font-bold tracking-wide">{lab.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 border rounded ${DIFFICULTY_COLORS[lab.difficulty]}`}>
                {lab.difficulty}
              </span>
              <span className="text-[10px] font-mono text-zinc-600">{lab.attackType}</span>
            </div>
          </div>
        </div>
        <OnlineBadge count={lab.online} />
      </div>

      {/* 描述 */}
      <p className="text-zinc-500 text-sm leading-relaxed mb-3">{lab.desc}</p>

      {/* 标签 + AI 风险评级 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lab.tags.map((tag) => (
          <span key={tag} className={`text-[10px] font-mono px-2 py-0.5 border rounded ${colors.tag}`}>{tag}</span>
        ))}
        {lab.cveId && (
          <span className="text-[10px] font-mono px-2 py-0.5 border rounded bg-red-500/5 text-red-500/70 border-red-500/15">{lab.cveId}</span>
        )}
        <span className={`text-[10px] font-mono px-2 py-0.5 border rounded ${AI_RISK_COLORS[lab.aiRisk]}`}>
          AI RISK: {lab.aiRisk}
        </span>
      </div>

      {/* 完成率进度条 */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-[10px] text-zinc-600">COMPLETION</span>
          <span className="font-mono text-[10px] text-zinc-400">{lab.completionRate}%</span>
        </div>
        <ProgressBar value={lab.completionRate} barClass={colors.bar} bgClass={colors.barBg} />
      </div>

      {/* 底部 */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
        <span className="font-mono text-[10px] text-zinc-600">
          <span className="text-zinc-400">{lab.learners.toLocaleString()}</span> 参训
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onEnter(lab); }}
          className={`
            font-mono text-[10px] tracking-wider px-4 py-1.5 rounded-lg border
            transition-all duration-200 hover:scale-105
            ${colors.btn}
          `}
        >
          ENTER LAB →
        </button>
      </div>
    </div>
  );
}

/* ---------- 热门漏洞排行 ---------- */
function VulnRankCard() {
  return (
    <div className="cyber-card rounded-xl border border-red-500/15 hover:border-red-500/30 transition-all">
      <div className="flex items-center justify-between p-4 border-b border-red-500/10">
        <div className="flex items-center gap-2">
          <span className="text-red-400">▸</span>
          <h3 className="font-bold text-sm tracking-wide">
            热门漏洞<span className="text-red-400">排行</span>
          </h3>
        </div>
        <span className="font-mono text-[10px] text-zinc-600">TOP 5</span>
      </div>

      <div className="p-4 space-y-2">
        {VULN_RANK.map((item) => {
          const sevStyle = SEVERITY_STYLES[item.severity];
          return (
            <div
              key={item.cve}
              className="flex items-center gap-3 px-3 py-2 rounded-lg
                border border-transparent hover:border-red-500/15 hover:bg-red-500/[0.02]
                transition-all"
            >
              <span
                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold shrink-0
                  ${item.rank <= 3 ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-zinc-800 text-zinc-500"}`}
              >
                {item.rank}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-300 truncate">{item.name}</span>
                  <span className={`text-[8px] font-mono px-1 py-0.5 border rounded ${sevStyle.color}`}>{sevStyle.label}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-600">{item.cve}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-zinc-500">{item.exploits.toLocaleString()}</span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    item.trend === "up" ? "text-red-400" : item.trend === "down" ? "text-green-400" : "text-zinc-500"
                  }`}
                >
                  {TREND_ICONS[item.trend]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- CVE 模拟区域 ---------- */
function CveSimulationCard() {
  return (
    <div className="cyber-card rounded-xl border border-cyan-500/15 hover:border-cyan-500/30 transition-all">
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">◈</span>
          <h3 className="font-bold text-sm tracking-wide">
            CVE <span className="text-cyan-400">模拟</span>
          </h3>
        </div>
        <span className="font-mono text-[10px] text-cyan-500/40 border border-cyan-500/15 rounded px-1.5 py-0.5">SIMULATION</span>
      </div>

      <div className="p-4 space-y-2">
        {CVE_SIMULATIONS.map((sim) => {
          const sevStyle = SEVERITY_STYLES[sim.severity];
          return (
            <div
              key={sim.id}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg border
                transition-all cursor-pointer
                ${
                  sim.status === "active"
                    ? "border-cyan-500/10 hover:border-cyan-500/25 hover:bg-cyan-500/[0.02]"
                    : sim.status === "coming"
                    ? "border-yellow-500/10 opacity-60"
                    : "border-zinc-800 opacity-40"
                }
              `}
            >
              <div
                className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 border
                  ${sim.cvss >= 9.0 ? "bg-red-500/10 border-red-500/30" : "bg-orange-500/10 border-orange-500/30"}`}
              >
                <span className={`text-[10px] font-mono font-bold ${sim.cvss >= 9.0 ? "text-red-400" : "text-orange-400"}`}>
                  {sim.cvss}
                </span>
                <span className="text-[7px] font-mono text-zinc-600">CVSS</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono font-bold text-zinc-300 truncate">{sim.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-zinc-600">{sim.cveId}</span>
                  <span className={`text-[8px] font-mono px-1 py-0.5 border rounded ${sevStyle.color}`}>{sevStyle.label}</span>
                </div>
              </div>

              <div className="shrink-0">
                {sim.status === "active" ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-breathe" />
                    LIVE
                  </span>
                ) : sim.status === "coming" ? (
                  <span className="text-[10px] font-mono text-yellow-500/60">SOON</span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-600">OFFLINE</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- 攻防演练状态 ---------- */
function DrillStatusCard() {
  const stats = useMemo(
    () => [
      { label: "进行中演练", value: "3", color: "text-cyan-400" },
      { label: "红队得分", value: "1,247", color: "text-red-400" },
      { label: "蓝队得分", value: "986", color: "text-cyan-400" },
      { label: "总拦截次数", value: "8,432", color: "text-green-400" },
    ],
    []
  );

  return (
    <div className="cyber-card rounded-xl border border-cyan-500/15 hover:border-cyan-500/30 transition-all">
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">◎</span>
          <h3 className="font-bold text-sm tracking-wide">
            攻防演练<span className="text-cyan-400">态势</span>
          </h3>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
          </span>
          LIVE
        </span>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="px-3 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30">
              <div className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-mono text-zinc-600">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-red-400 w-8">RED</span>
            <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-red-500/60" style={{ width: "56%" }} />
            </div>
            <span className="font-mono text-[10px] text-zinc-500">56%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-cyan-400 w-8">BLUE</span>
            <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-cyan-500/60" style={{ width: "44%" }} />
            </div>
            <span className="font-mono text-[10px] text-zinc-500">44%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 在线总览 ---------- */
function OnlineOverview() {
  const totalOnline = VULN_LABS.reduce((sum, lab) => sum + lab.online, 0);
  const totalLearners = VULN_LABS.reduce((sum, lab) => sum + lab.learners, 0);
  const activeCves = CVE_SIMULATIONS.filter((c) => c.status === "active").length;

  const items = [
    { label: "在线学员", value: totalOnline.toLocaleString(), color: "text-green-400", icon: "●" },
    { label: "累计参训", value: totalLearners.toLocaleString(), color: "text-cyan-400", icon: "◎" },
    { label: "在线靶场", value: `${VULN_LABS.length}`, color: "text-yellow-400", icon: "◈" },
    { label: "CVE 模拟", value: `${activeCves}`, color: "text-red-400", icon: "✦" },
  ];

  return (
    <div className="flex flex-wrap gap-6">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg border border-current/20 flex items-center justify-center text-lg ${item.color}`}>
            {item.icon}
          </div>
          <div>
            <div className={`text-sm font-bold font-mono ${item.color}`}>{item.value}</div>
            <div className="text-[10px] font-mono text-zinc-600">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ======================================================================
   主页面
   ====================================================================== */

export default function LabPage() {
  const [mounted, setMounted] = useState(false);
  const [activeLab, setActiveLab] = useState<VulnLab | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleEnterLab = (lab: VulnLab) => {
    setActiveLab(lab);
  };

  const handleCloseTerminal = () => {
    setActiveLab(null);
  };

  return (
    <div className="min-h-screen bg-black">
        {/* ===== Hero 区域 ===== */}
        <section className="relative border-b border-red-500/15 overflow-hidden">
          <ScanBackground />

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 sm:py-16">
            {/* 系统标识 */}
            <div className="font-mono text-[10px] text-red-500/50 tracking-[0.4em] mb-4">
              [ VULN LAB CENTER — AUTHORIZED ACCESS ONLY ]
            </div>

            {/* 标题 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              <span className="text-red-400">Vuln</span> Lab Center
            </h1>

            {/* 副标题 */}
            <p className="mt-3 text-zinc-500 text-sm sm:text-base max-w-lg leading-relaxed">
              真实漏洞环境实战演练，从攻击到防御，沉浸式网络安全训练
            </p>

            {/* 分隔线 */}
            <div className="mt-5 w-24 h-px bg-gradient-to-r from-red-500/50 to-transparent" />

            {/* 在线总览 */}
            <div className="mt-6">
              <OnlineOverview />
            </div>

            {/* 安全警告条 */}
            <div className="mt-6 flex items-center gap-3 px-4 py-2.5 border border-red-500/20 rounded-lg bg-red-500/[0.03]">
              <span className="text-red-400 text-sm shrink-0">⚠</span>
              <span className="font-mono text-[10px] text-red-400/70">
                WARNING: 所有靶场环境仅限授权安全研究与学习使用，任何未授权攻击行为均属违法
              </span>
            </div>
          </div>
        </section>

        {/* ===== 靶场分类区 ===== */}
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-red-400">◈</span>
            <h2 className="text-lg font-bold tracking-wide">
              漏洞<span className="text-red-400">靶场</span>
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/20 to-transparent ml-3" />
            <span className="font-mono text-[10px] text-zinc-600">
              {VULN_LABS.length} LABS AVAILABLE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VULN_LABS.map((lab, idx) => (
              <div key={lab.id} style={{ animationDelay: `${idx * 80}ms` }}>
                <LabCard lab={lab} onEnter={handleEnterLab} />
              </div>
            ))}
          </div>
        </section>

        {/* ===== 态势面板 (排行 + CVE + 攻击链 + 状态) ===== */}
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-cyan-400">◎</span>
            <h2 className="text-lg font-bold tracking-wide">
              态势<span className="text-cyan-400">面板</span>
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent ml-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <VulnRankCard />
            <CveSimulationCard />
            <DrillStatusCard />
            <StatusPanel />
          </div>

          {/* 攻击链流程图 — 全宽 */}
          <div className="mt-5">
            <AttackChainFlow />
          </div>
        </section>

        {/* ===== 底部 ===== */}
        <footer className="border-t border-cyan-500/10 px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="font-mono text-[10px] text-zinc-700">
              © 2025 CyberVerse AI — Vuln Lab Center v2.0
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-breathe" />
                <span>THREAT LEVEL: ELEVATED</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-breathe" />
                <span>ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>
          </div>
        </footer>

        {/* ===== 终端模拟器弹窗 ===== */}
        {activeLab && (
          <TerminalSimulator
            labId={activeLab.id}
            labTitle={activeLab.title}
            color={activeLab.color}
            onClose={handleCloseTerminal}
          />
        )}
    </div>
  );
}
