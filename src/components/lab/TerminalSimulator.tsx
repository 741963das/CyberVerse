"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ======================================================================
   类型
   ====================================================================== */
interface TerminalSimulatorProps {
  labId: string;
  labTitle: string;
  color: "cyan" | "danger" | "matrix" | "purple" | "warn";
  onClose: () => void;
}

interface TermLine {
  id: number;
  text: string;
  type: "system" | "success" | "error" | "warning" | "input" | "info" | "ai";
  timestamp: string;
}

/* ======================================================================
   数据
   ====================================================================== */
const INIT_SEQUENCE: { text: string; type: TermLine["type"]; delay: number }[] = [
  { text: "╔══════════════════════════════════════════════════╗", type: "system", delay: 200 },
  { text: "║       CyberVerse Vuln Lab — Secure Terminal     ║", type: "system", delay: 150 },
  { text: "╚══════════════════════════════════════════════════╝", type: "system", delay: 300 },
  { text: "", type: "system", delay: 100 },
  { text: "[SYS] Authenticating user credentials...", type: "info", delay: 600 },
  { text: "[SYS] ✓ Authentication successful — Access Level: TRAINING", type: "success", delay: 400 },
  { text: "[SYS] Initializing Container Runtime...", type: "info", delay: 800 },
  { text: "[DOCKER] Pulling image: cybervse/vuln-lab:latest", type: "system", delay: 1000 },
  { text: "[DOCKER] ✓ Docker Runtime Active — Container ID: a7f3c2e1", type: "success", delay: 500 },
  { text: "[NET] Allocating sandbox network namespace...", type: "info", delay: 700 },
  { text: "[NET] ✓ Target IP Allocated — 10.0.3.{LAB_IP}", type: "success", delay: 400 },
  { text: "[AI] Loading AI Threat Detection Engine...", type: "warning", delay: 900 },
  { text: "[AI] ✓ AI Threat Detection Enabled — Model: CyberShield-v3", type: "success", delay: 500 },
  { text: "[SEC] Deploying network isolation rules...", type: "info", delay: 600 },
  { text: "[SEC] ✓ Sandbox isolated — No external egress", type: "success", delay: 300 },
  { text: "", type: "system", delay: 100 },
  { text: "══════════════════════════════════════════════════", type: "system", delay: 200 },
  { text: "  LAB ENVIRONMENT READY — AWAITING OPERATOR INPUT", type: "warning", delay: 300 },
  { text: "══════════════════════════════════════════════════", type: "system", delay: 200 },
  { text: "", type: "system", delay: 100 },
  { text: 'Type "help" for available commands or start your attack vector.', type: "ai", delay: 400 },
];

const COMMAND_RESPONSES: Record<string, { lines: { text: string; type: TermLine["type"] }[] }> = {
  help: {
    lines: [
      { text: "┌─────────────────────────────────────────────┐", type: "system" },
      { text: "│ Available Commands:                          │", type: "system" },
      { text: "│  scan      — Port scan target system        │", type: "info" },
      { text: "│  exploit   — Launch attack vector           │", type: "warning" },
      { text: "│  analyze   — AI vulnerability analysis      │", type: "ai" },
      { text: "│  status    — Check lab environment status   │", type: "info" },
      { text: "│  logs      — View attack logs               │", type: "info" },
      { text: "│  clear     — Clear terminal                 │", type: "system" },
      { text: "│  exit      — Terminate lab session          │", type: "error" },
      { text: "└─────────────────────────────────────────────┘", type: "system" },
    ],
  },
  scan: {
    lines: [
      { text: "[SCAN] Initiating Nmap scan on 10.0.3.{LAB_IP}...", type: "info" },
      { text: "[SCAN] Scanning ports 1-65535...", type: "system" },
      { text: "[SCAN] PORT     STATE   SERVICE", type: "system" },
      { text: "[SCAN] 22/tcp   open    ssh", type: "success" },
      { text: "[SCAN] 80/tcp   open    http", type: "success" },
      { text: "[SCAN] 443/tcp  open    https", type: "success" },
      { text: "[SCAN] 3306/tcp open    mysql", type: "warning" },
      { text: "[SCAN] 8080/tcp open    http-proxy", type: "warning" },
      { text: "[SCAN] Scan complete — 5 open ports detected", type: "info" },
      { text: "[AI] High risk: MySQL (3306) exposed to application layer", type: "ai" },
    ],
  },
  exploit: {
    lines: [
      { text: "[ATK] Preparing exploit payload...", type: "warning" },
      { text: "[ATK] Target: 10.0.3.{LAB_IP}:80 — Vulnerable parameter: id", type: "info" },
      { text: "[ATK] Injecting payload: ' OR 1=1 --", type: "warning" },
      { text: "[ATK] Sending HTTP request...", type: "system" },
      { text: "[ATK] ✓ Authentication bypassed!", type: "success" },
      { text: "[ATK] Extracting database schema...", type: "warning" },
      { text: "[ATK] ✓ 3 tables extracted: users, sessions, config", type: "success" },
      { text: "[ATK] Sensitive data accessed: admin credentials hash", type: "error" },
      { text: "", type: "system" },
      { text: "╔══════════════════════════════════════════════════╗", type: "success" },
      { text: "║   ✓  ATTACK SUCCESSFUL — FLAG CAPTURED          ║", type: "success" },
      { text: "║   FLAG: CV{sqli_b4s1c_uni0n_3xpl01t}           ║", type: "success" },
      { text: "╚══════════════════════════════════════════════════╝", type: "success" },
      { text: "", type: "system" },
      { text: "[AI] Attack pattern detected: SQL Injection (Union-based)", type: "ai" },
      { text: "[AI] Recommendation: Use parameterized queries to prevent injection", type: "ai" },
      { text: "[AI] Risk Score: 9.2/10 — Critical vulnerability confirmed", type: "ai" },
    ],
  },
  analyze: {
    lines: [
      { text: "[AI] Running AI-powered vulnerability analysis...", type: "ai" },
      { text: "[AI] Analyzing attack surface...", type: "system" },
      { text: "[AI] ┌─────────────────────────────────────┐", type: "ai" },
      { text: "[AI] │ Vulnerability Assessment Report       │", type: "ai" },
      { text: "[AI] ├─────────────────────────────────────┤", type: "ai" },
      { text: "[AI] │ SQL Injection    : CRITICAL (9.2)    │", type: "error" },
      { text: "[AI] │ XSS (Reflected)  : HIGH (7.8)       │", type: "warning" },
      { text: "[AI] │ CSRF             : MEDIUM (5.4)      │", type: "info" },
      { text: "[AI] │ Info Disclosure  : LOW (3.2)         │", type: "success" },
      { text: "[AI] └─────────────────────────────────────┘", type: "ai" },
      { text: "[AI] Recommended fix order: SQLi → XSS → CSRF → InfoLeak", type: "ai" },
    ],
  },
  status: {
    lines: [
      { text: "[STATUS] Lab Environment Status:", type: "info" },
      { text: "[STATUS]   Container:  RUNNING (a7f3c2e1)", type: "success" },
      { text: "[STATUS]   Target IP: 10.0.3.{LAB_IP}", type: "info" },
      { text: "[STATUS]   Uptime:    00:12:34", type: "info" },
      { text: "[STATUS]   CPU: 12%   MEM: 256MB/512MB", type: "system" },
      { text: "[STATUS]   AI Engine: ACTIVE", type: "ai" },
      { text: "[STATUS]   Isolation: ENFORCED", type: "success" },
    ],
  },
  logs: {
    lines: [
      { text: "[LOGS] Recent attack logs:", type: "info" },
      { text: "[LOGS] 14:32:08  192.168.1.105 → SQL-LAB-01  SQL Injection    BLOCKED", type: "success" },
      { text: "[LOGS] 14:31:45  10.0.0.88    → XSS-LAB-03   XSS Stored       DETECTED", type: "warning" },
      { text: "[LOGS] 14:30:22  172.16.0.12  → RCE-LAB-01   Command Exec     ANALYZING", type: "ai" },
      { text: "[LOGS] 14:29:17  192.168.2.44 → UPLOAD-LAB-02 Webshell Upload  BLOCKED", type: "success" },
      { text: "[LOGS] 14:28:03  10.0.1.201   → SSRF-LAB-01  SSRF Probe       DETECTED", type: "warning" },
    ],
  },
};

/* ======================================================================
   颜色映射
   ====================================================================== */
const LINE_COLORS: Record<TermLine["type"], string> = {
  system: "text-zinc-500",
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  input: "text-cyan-300",
  info: "text-cyan-400/80",
  ai: "text-purple-400",
};

const ACCENT_MAP = {
  cyan: { border: "border-cyan-500/30", glow: "shadow-[0_0_60px_#00f0ff15]", header: "bg-cyan-500/10" },
  danger: { border: "border-red-500/30", glow: "shadow-[0_0_60px_#ff004015]", header: "bg-red-500/10" },
  matrix: { border: "border-green-500/30", glow: "shadow-[0_0_60px_#00ff4115]", header: "bg-green-500/10" },
  purple: { border: "border-purple-500/30", glow: "shadow-[0_0_60px_#a855f715]", header: "bg-purple-500/10" },
  warn: { border: "border-yellow-500/30", glow: "shadow-[0_0_60px_#ffb80015]", header: "bg-yellow-500/10" },
};

/* ======================================================================
   组件
   ====================================================================== */
export default function TerminalSimulator({ labId, labTitle, color, onClose }: TerminalSimulatorProps) {
  const [lines, setLines] = useState<TermLine[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineIdRef = useRef(0);
  const accent = ACCENT_MAP[color];

  /* 生成时间戳 */
  const getTimestamp = useCallback(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  }, []);

  /* 滚动到底部 */
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  /* 添加一行 */
  const addLine = useCallback(
    (text: string, type: TermLine["type"]) => {
      lineIdRef.current += 1;
      setLines((prev) => [...prev, { id: lineIdRef.current, text, type, timestamp: getTimestamp() }]);
    },
    [getTimestamp]
  );

  /* 初始化序列 — 打字机效果 */
  useEffect(() => {
    let cancelled = false;
    let currentDelay = 400;

    const runInit = async () => {
      for (const step of INIT_SEQUENCE) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, step.delay));
        if (cancelled) return;

        const labIp = 100 + Math.floor(Math.random() * 150);
        const text = step.text.replace("{LAB_IP}", String(labIp)).replace("{LAB_ID}", labId.toUpperCase());
        addLine(text, step.type);
        scrollToBottom();
      }
      if (!cancelled) {
        setIsInitializing(false);
      }
    };

    runInit();
    return () => {
      cancelled = true;
    };
  }, [labId, addLine, scrollToBottom]);

  /* 自动滚动 */
  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  /* 聚焦输入框 */
  useEffect(() => {
    if (!isInitializing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInitializing]);

  /* 处理命令 */
  const handleCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim().toLowerCase();
      addLine(`operator@cybervse:~$ ${cmd}`, "input");
      scrollToBottom();

      if (trimmed === "clear") {
        setLines([]);
        return;
      }

      if (trimmed === "exit") {
        addLine("[SYS] Terminating lab session...", "warning");
        setTimeout(() => onClose(), 800);
        return;
      }

      const response = COMMAND_RESPONSES[trimmed];
      if (response) {
        setIsTyping(true);
        let idx = 0;
        const interval = setInterval(() => {
          if (idx < response.lines.length) {
            const labIp = 100 + Math.floor(Math.random() * 150);
            const text = response.lines[idx].text.replace("{LAB_IP}", String(labIp));
            addLine(text, response.lines[idx].type);
            scrollToBottom();
            idx++;
          } else {
            clearInterval(interval);
            setIsTyping(false);
          }
        }, 150);
      } else {
        addLine(`-bash: ${trimmed}: command not found. Type "help" for available commands.`, "error");
      }
    },
    [addLine, scrollToBottom, onClose]
  );

  /* 提交 */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isInitializing || isTyping) return;
      handleCommand(inputValue);
      setInputValue("");
    },
    [inputValue, isInitializing, isTyping, handleCommand]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* 终端窗口 */}
      <div
        className={`
          relative w-full max-w-4xl h-[85vh] max-h-[700px]
          flex flex-col rounded-xl overflow-hidden
          border ${accent.border} ${accent.glow}
          bg-[#0a0a0f]
        `}
      >
        {/* ===== 终端头部 ===== */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${accent.border} ${accent.header}`}>
          <div className="flex items-center gap-3">
            {/* 三色点 */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-400 transition-colors"
              />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="font-mono text-[10px] text-zinc-500 tracking-wider">
              {labTitle} — Terminal Session
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isInitializing && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-yellow-400">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                INITIALIZING
              </span>
            )}
            {!isInitializing && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-breathe" />
                CONNECTED
              </span>
            )}
            <button
              onClick={onClose}
              className="font-mono text-[10px] text-zinc-600 hover:text-red-400 transition-colors px-2 py-1 border border-zinc-800 rounded hover:border-red-500/30"
            >
              ✕ EXIT
            </button>
          </div>
        </div>

        {/* ===== 终端内容 ===== */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-0.5"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line) => (
            <div key={line.id} className="flex gap-2">
              <span className="text-zinc-700 shrink-0 select-none">{line.timestamp}</span>
              <span className={`${LINE_COLORS[line.type]} break-all`}>{line.text}</span>
            </div>
          ))}

          {/* 输入行 */}
          {!isInitializing && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
              <span className="text-cyan-400 shrink-0">operator@cybervse:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-transparent text-cyan-300 outline-none caret-cyan-400 disabled:opacity-50"
                spellCheck={false}
                autoComplete="off"
              />
              <span className="animate-blink-cursor text-cyan-400">▌</span>
            </form>
          )}

          {/* 初始化中的光标 */}
          {isInitializing && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400 text-xs">$</span>
              <span className="animate-blink-cursor text-yellow-400">▌</span>
            </div>
          )}
        </div>

        {/* ===== 底部状态栏 ===== */}
        <div className={`flex items-center justify-between px-4 py-1.5 border-t ${accent.border} bg-zinc-950/50`}>
          <div className="flex items-center gap-4 font-mono text-[9px] text-zinc-600">
            <span>LAB: {labId.toUpperCase()}</span>
            <span>USER: OPERATOR</span>
            <span>ACCESS: TRAINING</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px]">
            <span className="text-purple-400">AI: ACTIVE</span>
            <span className="text-green-400">SANDBOX: ISOLATED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
