"use client";

import { useState, useEffect } from "react";

/* ======================================================================
   攻击链流程图
   展示典型 Kill Chain 的各阶段
   ====================================================================== */

interface ChainNode {
  id: string;
  label: string;
  icon: string;
  status: "active" | "completed" | "pending" | "danger";
  detail: string;
}

const CHAIN_NODES: ChainNode[] = [
  { id: "recon", label: "侦察", icon: "◉", status: "completed", detail: "Port scanning & OSINT" },
  { id: "weaponize", label: "武器化", icon: "◈", status: "completed", detail: "Payload crafting" },
  { id: "deliver", label: "投递", icon: "⬡", status: "active", detail: "Exploit delivery" },
  { id: "exploit", label: "利用", icon: "▸", status: "pending", detail: "Vulnerability trigger" },
  { id: "install", label: "安装", icon: "◎", status: "pending", detail: "Backdoor deploy" },
  { id: "c2", label: "控制", icon: "✦", status: "pending", detail: "C2 channel establish" },
  { id: "exfil", label: "渗出", icon: "◆", status: "danger", detail: "Data exfiltration" },
];

const STATUS_STYLES: Record<ChainNode["status"], { node: string; label: string; line: string }> = {
  completed: {
    node: "border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_0_12px_#00ff4120]",
    label: "text-green-400",
    line: "bg-green-500/40",
  },
  active: {
    node: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_16px_#00f0ff30] animate-breathe",
    label: "text-cyan-400",
    line: "bg-cyan-500/30",
  },
  pending: {
    node: "border-zinc-700 bg-zinc-800/30 text-zinc-600",
    label: "text-zinc-600",
    line: "bg-zinc-800",
  },
  danger: {
    node: "border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_12px_#ff004020] animate-pulse",
    label: "text-red-400",
    line: "bg-red-500/30",
  },
};

export default function AttackChainFlow() {
  const [activeStep, setActiveStep] = useState(2);

  /* 自动推进攻击链动画 */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < CHAIN_NODES.length - 1 ? prev + 1 : 0));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const nodes = CHAIN_NODES.map((node, idx) => {
    if (idx < activeStep) return { ...node, status: "completed" as const };
    if (idx === activeStep) return { ...node, status: "active" as const };
    if (idx === CHAIN_NODES.length - 1) return { ...node, status: "danger" as const };
    return { ...node, status: "pending" as const };
  });

  return (
    <div className="cyber-card rounded-xl border border-red-500/15 hover:border-red-500/25 transition-all">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-red-500/10">
        <div className="flex items-center gap-2">
          <span className="text-red-400">◆</span>
          <h3 className="font-bold text-sm tracking-wide">
            攻击链<span className="text-red-400">流程</span>
          </h3>
        </div>
        <span className="font-mono text-[10px] text-red-500/40 border border-red-500/15 rounded px-1.5 py-0.5">
          KILL CHAIN
        </span>
      </div>

      {/* 流程图 — 桌面端横向，移动端纵向 */}
      <div className="p-4">
        {/* 桌面端横向流程 */}
        <div className="hidden md:flex items-center justify-between gap-0">
          {nodes.map((node, idx) => {
            const style = STATUS_STYLES[node.status];
            return (
              <div key={node.id} className="flex items-center flex-1">
                {/* 节点 */}
                <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition-all duration-500 ${style.node}`}
                  >
                    {node.icon}
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${style.label}`}>{node.label}</span>
                  <span className="text-[8px] font-mono text-zinc-700 text-center max-w-[70px]">{node.detail}</span>
                </div>
                {/* 连接线 */}
                {idx < nodes.length - 1 && (
                  <div className="flex-1 mx-1 mt-[-20px]">
                    <div className={`h-[2px] rounded-full transition-all duration-700 ${style.line}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 移动端纵向流程 */}
        <div className="md:hidden space-y-0">
          {nodes.map((node, idx) => {
            const style = STATUS_STYLES[node.status];
            return (
              <div key={node.id} className="flex items-stretch">
                {/* 纵向线 + 节点 */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs shrink-0 transition-all duration-500 ${style.node}`}
                  >
                    {node.icon}
                  </div>
                  {idx < nodes.length - 1 && (
                    <div className={`w-[2px] flex-1 min-h-[16px] transition-all duration-700 ${style.line}`} />
                  )}
                </div>
                {/* 信息 */}
                <div className="ml-3 pb-3">
                  <span className={`text-[11px] font-mono font-bold ${style.label}`}>{node.label}</span>
                  <div className="text-[9px] font-mono text-zinc-700">{node.detail}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 当前阶段说明 */}
        <div className="mt-4 p-3 border border-red-500/10 rounded-lg bg-red-500/[0.02]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-breathe" />
            <span className="font-mono text-[10px] text-cyan-400">
              CURRENT: {CHAIN_NODES[activeStep].label.toUpperCase()} — {CHAIN_NODES[activeStep].detail}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
