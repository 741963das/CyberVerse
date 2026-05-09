"use client";

import { useState, useEffect, useCallback } from "react";

/* ======================================================================
   实时状态面板
   模拟实时攻击检测 + 状态灯 + 日志滚动
   ====================================================================== */

interface StatusItem {
  id: string;
  label: string;
  status: "online" | "warning" | "danger" | "offline";
  detail: string;
}

interface LiveLog {
  id: number;
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

const STATUS_ITEMS: StatusItem[] = [
  { id: "firewall", label: "Firewall", status: "online", detail: "WAF Active" },
  { id: "ids", label: "IDS", status: "online", detail: "Snort Running" },
  { id: "sandbox", label: "Sandbox", status: "online", detail: "6 Containers" },
  { id: "ai-engine", label: "AI Engine", status: "online", detail: "CyberShield-v3" },
  { id: "honeypot", label: "Honeypot", status: "warning", detail: "3 Traps Triggered" },
  { id: "siem", label: "SIEM", status: "online", detail: "Log Collector" },
];

const STATUS_DOT: Record<StatusItem["status"], { color: string; animate: string }> = {
  online: { color: "bg-green-400", animate: "animate-breathe" },
  warning: { color: "bg-yellow-400", animate: "animate-pulse" },
  danger: { color: "bg-red-400", animate: "animate-pulse" },
  offline: { color: "bg-zinc-600", animate: "" },
};

const LOG_POOL: { message: string; type: LiveLog["type"] }[] = [
  { message: "SQL injection attempt blocked from 192.168.1.105", type: "success" },
  { message: "XSS payload detected in parameter 'q'", type: "warning" },
  { message: "Port scan detected: 22, 80, 443, 3306", type: "warning" },
  { message: "Brute force attempt on SSH — 23 failures", type: "error" },
  { message: "Container health check: all 6 healthy", type: "info" },
  { message: "Webshell upload blocked — .php extension", type: "success" },
  { message: "SSRF probe to internal metadata endpoint", type: "warning" },
  { message: "AI model updated — false positive rate -12%", type: "info" },
  { message: "Path traversal attempt on /etc/passwd", type: "error" },
  { message: "Honeypot triggered — decoy database accessed", type: "warning" },
  { message: "Rate limit enforced — 429 on /api/login", type: "success" },
  { message: "CSRF token mismatch — request rejected", type: "success" },
  { message: "DNS exfiltration pattern detected", type: "error" },
  { message: "Sandbox snapshot saved for forensics", type: "info" },
];

const LOG_COLORS: Record<LiveLog["type"], string> = {
  info: "text-cyan-400/70",
  success: "text-green-400/70",
  warning: "text-yellow-400/70",
  error: "text-red-400/70",
};

let logIdCounter = 0;

export default function StatusPanel() {
  const [logs, setLogs] = useState<LiveLog[]>([]);
  const [threatLevel, setThreatLevel] = useState<"low" | "medium" | "high" | "critical">("medium");

  const addLog = useCallback(() => {
    const entry = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    logIdCounter += 1;
    const newLog: LiveLog = { id: logIdCounter, time, message: entry.message, type: entry.type };

    setLogs((prev) => {
      const next = [...prev, newLog];
      return next.length > 20 ? next.slice(-20) : next;
    });

    /* 根据日志类型调整威胁等级 */
    if (entry.type === "error") {
      setThreatLevel("high");
    } else if (entry.type === "warning") {
      setThreatLevel((prev) => (prev === "low" ? "medium" : prev));
    } else {
      setThreatLevel((prev) => (prev === "high" ? "medium" : prev === "medium" ? "low" : prev));
    }
  }, []);

  /* 自动滚动日志 */
  useEffect(() => {
    addLog();
    const timer = setInterval(addLog, 2500);
    return () => clearInterval(timer);
  }, [addLog]);

  const threatConfig: Record<string, { color: string; label: string; bg: string }> = {
    low: { color: "text-green-400", label: "LOW", bg: "bg-green-500/10 border-green-500/20" },
    medium: { color: "text-yellow-400", label: "MEDIUM", bg: "bg-yellow-500/10 border-yellow-500/20" },
    high: { color: "text-red-400", label: "HIGH", bg: "bg-red-500/10 border-red-500/20" },
    critical: { color: "text-red-500", label: "CRITICAL", bg: "bg-red-500/15 border-red-500/30" },
  };

  const tc = threatConfig[threatLevel];

  return (
    <div className="cyber-card rounded-xl border border-cyan-500/15 hover:border-cyan-500/25 transition-all">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">◉</span>
          <h3 className="font-bold text-sm tracking-wide">
            实时<span className="text-cyan-400">状态</span>
          </h3>
        </div>
        {/* 威胁等级 */}
        <div className={`flex items-center gap-1.5 px-2 py-1 border rounded ${tc.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tc.color} animate-pulse`} />
          <span className={`font-mono text-[10px] font-bold ${tc.color}`}>
            THREAT: {tc.label}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 状态灯面板 */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STATUS_ITEMS.map((item) => {
            const dot = STATUS_DOT[item.status];
            return (
              <div
                key={item.id}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30"
              >
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${dot.color} ${dot.animate}`} />
                </div>
                <span className="text-[9px] font-mono text-zinc-400 text-center">{item.label}</span>
                <span className="text-[7px] font-mono text-zinc-600 text-center">{item.detail}</span>
              </div>
            );
          })}
        </div>

        {/* 实时日志流 */}
        <div className="border border-zinc-800/60 rounded-lg bg-[#0a0a0f] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-800/40 bg-zinc-950">
            <span className="w-2 h-2 rounded-full bg-red-500/60" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <span className="w-2 h-2 rounded-full bg-green-500/60" />
            <span className="ml-2 font-mono text-[9px] text-zinc-600">
              live-monitor@cyberverse
            </span>
            <span className="ml-auto flex items-center gap-1 text-[9px] font-mono text-green-400">
              <span className="w-1 h-1 rounded-full bg-green-400 animate-breathe" />
              LIVE
            </span>
          </div>
          <div className="p-3 max-h-[160px] overflow-y-auto space-y-0.5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-[10px] font-mono">
                <span className="text-zinc-700 shrink-0">{log.time}</span>
                <span className={`${LOG_COLORS[log.type]} flex-1 break-all`}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
