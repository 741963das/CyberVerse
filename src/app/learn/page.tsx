"use client";

import { useState, useEffect, useMemo } from "react";
import { getModuleContent } from "@/data/learnContent";
import type { ModuleContent } from "@/data/learnContent";
import LessonViewer from "@/components/learn/LessonViewer";

/* ======================================================================
   数据层
   ====================================================================== */

interface LearnModule {
  id: string;
  title: string;
  desc: string;
  level: "入门" | "进阶" | "高级" | "前沿";
  lessons: number;
  learners: number;
  color: "cyan" | "danger" | "matrix" | "purple";
  icon: string;
  progress: number;
  tags: string[];
}

interface DailyTask {
  id: string;
  title: string;
  category: string;
  xp: number;
  done: boolean;
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface SkillNode {
  id: string;
  title: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  branch: string;
}

/* ---------- 分类模块 ---------- */
const LEARN_MODULES: LearnModule[] = [
  {
    id: "web-security",
    title: "Web 安全",
    desc: "SQL注入、XSS、CSRF 等 Web 常见漏洞原理与防御实战",
    level: "入门",
    lessons: 24,
    learners: 4280,
    color: "cyan",
    icon: "⬡",
    progress: 68,
    tags: ["OWASP", "SQLi", "XSS"],
  },
  {
    id: "pentest",
    title: "渗透测试",
    desc: "信息收集、漏洞利用、后渗透全流程实战演练",
    level: "高级",
    lessons: 32,
    learners: 2156,
    color: "danger",
    icon: "◈",
    progress: 23,
    tags: ["Kali", "Metasploit", "Burp"],
  },
  {
    id: "crypto",
    title: "密码学",
    desc: "对称/非对称加密、数字签名、PKI 体系与密码分析",
    level: "进阶",
    lessons: 15,
    learners: 1890,
    color: "matrix",
    icon: "◉",
    progress: 45,
    tags: ["AES", "RSA", "Hash"],
  },
  {
    id: "network",
    title: "网络攻防",
    desc: "网络协议分析、防火墙配置、IDS/IPS 入侵检测技术",
    level: "进阶",
    lessons: 18,
    learners: 3120,
    color: "purple",
    icon: "◎",
    progress: 51,
    tags: ["Wireshark", "Nmap", "Firewall"],
  },
  {
    id: "reverse",
    title: "逆向工程",
    desc: "二进制分析、反汇编、脱壳与恶意软件深度分析",
    level: "高级",
    lessons: 20,
    learners: 1240,
    color: "cyan",
    icon: "⟐",
    progress: 12,
    tags: ["IDA", "GDB", "OllyDbg"],
  },
  {
    id: "ai-security",
    title: "AI 安全",
    desc: "对抗样本、模型窃取、Prompt注入等 AI 安全前沿领域",
    level: "前沿",
    lessons: 12,
    learners: 960,
    color: "matrix",
    icon: "✦",
    progress: 5,
    tags: ["Adversarial", "LLM", "Fuzzing"],
  },
];

/* ---------- 今日任务 ---------- */
const DAILY_TASKS: DailyTask[] = [
  { id: "t1", title: "完成 SQL 注入基础实验", category: "Web 安全", xp: 50, done: true },
  { id: "t2", title: "阅读 XSS 防御白皮书", category: "Web 安全", xp: 30, done: true },
  { id: "t3", title: "Nmap 扫描实战练习", category: "网络攻防", xp: 60, done: false },
  { id: "t4", title: "AES 加密算法实现", category: "密码学", xp: 80, done: false },
  { id: "t5", title: "完成每日安全挑战", category: "综合", xp: 100, done: false },
];

/* ---------- 成就徽章 ---------- */
const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "初次渗透", desc: "完成第一个渗透测试实验", icon: "◈", unlocked: true, rarity: "common" },
  { id: "a2", title: "SQL 猎手", desc: "完成所有 SQL 注入课程", icon: "⬡", unlocked: true, rarity: "rare" },
  { id: "a3", title: "密码大师", desc: "掌握 AES/RSA/ECC 三大算法", icon: "◉", unlocked: false, rarity: "epic" },
  { id: "a4", title: "逆向先锋", desc: "成功逆向 3 个恶意样本", icon: "⟐", unlocked: false, rarity: "epic" },
  { id: "a5", title: "AI 守卫者", desc: "完成所有 AI 安全课程", icon: "✦", unlocked: false, rarity: "legendary" },
  { id: "a6", title: "全栈安全师", desc: "所有分类进度达到 100%", icon: "◎", unlocked: false, rarity: "legendary" },
];

/* ---------- 技能树 ---------- */
const SKILL_TREE: SkillNode[] = [
  { id: "s1", title: "HTTP 基础", level: 3, maxLevel: 3, unlocked: true, branch: "web" },
  { id: "s2", title: "SQL 注入", level: 2, maxLevel: 3, unlocked: true, branch: "web" },
  { id: "s3", title: "XSS 攻防", level: 1, maxLevel: 3, unlocked: true, branch: "web" },
  { id: "s4", title: "CSRF 防御", level: 0, maxLevel: 3, unlocked: false, branch: "web" },
  { id: "s5", title: "网络基础", level: 3, maxLevel: 3, unlocked: true, branch: "net" },
  { id: "s6", title: "端口扫描", level: 2, maxLevel: 3, unlocked: true, branch: "net" },
  { id: "s7", title: "漏洞利用", level: 1, maxLevel: 3, unlocked: true, branch: "pentest" },
  { id: "s8", title: "后渗透", level: 0, maxLevel: 3, unlocked: false, branch: "pentest" },
  { id: "s9", title: "对称加密", level: 2, maxLevel: 3, unlocked: true, branch: "crypto" },
  { id: "s10", title: "非对称加密", level: 1, maxLevel: 3, unlocked: true, branch: "crypto" },
  { id: "s11", title: "反汇编", level: 0, maxLevel: 3, unlocked: false, branch: "reverse" },
  { id: "s12", title: "对抗样本", level: 0, maxLevel: 3, unlocked: false, branch: "ai" },
];

/* ---------- AI 推荐路径 ---------- */
const AI_PATH = [
  { step: 1, title: "Web 安全基础", status: "completed" as const, desc: "掌握 OWASP Top 10" },
  { step: 2, title: "网络协议分析", status: "current" as const, desc: "Wireshark + TCP/IP 深度理解" },
  { step: 3, title: "渗透测试入门", status: "locked" as const, desc: "Kali Linux + Metasploit" },
  { step: 4, title: "密码学实战", status: "locked" as const, desc: "加密算法实现与破解" },
  { step: 5, title: "高级渗透", status: "locked" as const, desc: "内网渗透与红队技术" },
  { step: 6, title: "AI 安全前沿", status: "locked" as const, desc: "对抗 ML & LLM 安全" },
];

/* ======================================================================
   样式映射
   ====================================================================== */

const LEVEL_COLORS: Record<string, string> = {
  "入门": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "进阶": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  "高级": "bg-red-500/10 text-red-400 border-red-500/30",
  "前沿": "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const COLOR_MAP = {
  cyan: {
    border: "border-cyan-500/20 hover:border-cyan-400/50",
    glow: "hover:shadow-[0_0_30px_#00f0ff20,inset_0_0_30px_#00f0ff08]",
    icon: "text-cyan-400",
    bar: "bg-cyan-400",
    barBg: "bg-cyan-500/10",
    tag: "bg-cyan-500/5 text-cyan-500/70 border-cyan-500/15",
  },
  danger: {
    border: "border-red-500/20 hover:border-red-400/50",
    glow: "hover:shadow-[0_0_30px_#ff004020,inset_0_0_30px_#ff004008]",
    icon: "text-red-400",
    bar: "bg-red-400",
    barBg: "bg-red-500/10",
    tag: "bg-red-500/5 text-red-500/70 border-red-500/15",
  },
  matrix: {
    border: "border-green-500/20 hover:border-green-400/50",
    glow: "hover:shadow-[0_0_30px_#00ff4120,inset_0_0_30px_#00ff4108]",
    icon: "text-green-400",
    bar: "bg-green-400",
    barBg: "bg-green-500/10",
    tag: "bg-green-500/5 text-green-500/70 border-green-500/15",
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-400/50",
    glow: "hover:shadow-[0_0_30px_#a855f720,inset_0_0_30px_#a855f708]",
    icon: "text-purple-400",
    bar: "bg-purple-400",
    barBg: "bg-purple-500/10",
    tag: "bg-purple-500/5 text-purple-500/70 border-purple-500/15",
  },
};

const RARITY_COLORS: Record<string, string> = {
  common: "border-zinc-600/40 text-zinc-400",
  rare: "border-cyan-500/40 text-cyan-400",
  epic: "border-purple-500/40 text-purple-400",
  legendary: "border-yellow-500/40 text-yellow-400",
};

const RARITY_GLOW: Record<string, string> = {
  common: "",
  rare: "hover:shadow-[0_0_20px_#00f0ff15]",
  epic: "hover:shadow-[0_0_20px_#a855f715]",
  legendary: "hover:shadow-[0_0_20px_#ffb80015]",
};

const BRANCH_COLORS: Record<string, string> = {
  web: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
  net: "text-purple-400 border-purple-500/30 bg-purple-500/5",
  pentest: "text-red-400 border-red-500/30 bg-red-500/5",
  crypto: "text-green-400 border-green-500/30 bg-green-500/5",
  reverse: "text-cyan-300 border-cyan-400/20 bg-cyan-400/5",
  ai: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",
};

/* ======================================================================
   子组件
   ====================================================================== */

/* ---------- 扫描背景 ---------- */
function ScanBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 网格 */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      {/* 横向扫描光 */}
      <div className="absolute top-0 w-[30%] h-full bg-gradient-to-r from-transparent via-cyan-500/[0.03] to-transparent animate-h-scan" />
      {/* 竖向渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
    </div>
  );
}

/* ---------- 进度条 ---------- */
function ProgressBar({
  value,
  barClass,
  bgClass,
}: {
  value: number;
  barClass: string;
  bgClass: string;
}) {
  return (
    <div className={`w-full h-1.5 rounded-full ${bgClass} overflow-hidden`}>
      <div
        className={`h-full rounded-full ${barClass} transition-all duration-700 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/* ---------- 分类模块卡片 ---------- */
function ModuleCard({ module, onClick }: { module: LearnModule; onClick: () => void }) {
  const colors = COLOR_MAP[module.color];
  return (
    <div
      onClick={onClick}
      className={`
        cyber-card rounded-xl p-5 cursor-pointer group
        ${colors.border} ${colors.glow}
        transition-all duration-300
      `}
    >
      {/* 头部：图标 + 标题 + 难度 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg border border-current/20 flex items-center justify-center text-2xl ${colors.icon} group-hover:scale-110 transition-transform duration-300`}
          >
            {module.icon}
          </div>
          <div>
            <h3 className="font-bold tracking-wide">{module.title}</h3>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 border rounded ${LEVEL_COLORS[module.level]}`}>
              {module.level}
            </span>
          </div>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-zinc-500 text-sm leading-relaxed mb-3">
        {module.desc}
      </p>

      {/* 标签 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {module.tags.map((tag) => (
          <span key={tag} className={`text-[10px] font-mono px-2 py-0.5 border rounded ${colors.tag}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* 进度条 */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-[10px] text-zinc-600">PROGRESS</span>
          <span className="font-mono text-[10px] text-zinc-400">{module.progress}%</span>
        </div>
        <ProgressBar value={module.progress} barClass={colors.bar} bgClass={colors.barBg} />
      </div>

      {/* 底部统计 */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-zinc-600">
            <span className="text-zinc-400">{module.lessons}</span> 课时
          </span>
          <span className="font-mono text-[10px] text-zinc-600">
            <span className="text-zinc-400">{module.learners.toLocaleString()}</span> 学习
          </span>
        </div>
        <div className={`font-mono text-[10px] ${colors.icon} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
          <span>ENTER</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- 今日学习任务 ---------- */
function DailyTasksCard() {
  const [tasks, setTasks] = useState(DAILY_TASKS);

  const completedCount = tasks.filter((t) => t.done).length;
  const totalXp = tasks.reduce((sum, t) => sum + t.xp, 0);
  const earnedXp = tasks.filter((t) => t.done).reduce((sum, t) => sum + t.xp, 0);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <div className="cyber-card rounded-xl border border-cyan-500/15 hover:border-cyan-500/30 transition-all">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">▸</span>
          <h3 className="font-bold text-sm tracking-wide">今日任务</h3>
        </div>
        <div className="font-mono text-[10px] text-zinc-500">
          <span className="text-cyan-400">{completedCount}</span>/{tasks.length}{" "}
          <span className="ml-2 text-yellow-400">{earnedXp}</span>/{totalXp} XP
        </div>
      </div>

      {/* 进度条 */}
      <div className="px-4 pt-3">
        <ProgressBar
          value={Math.round((completedCount / tasks.length) * 100)}
          barClass="bg-cyan-400"
          bgClass="bg-cyan-500/10"
        />
      </div>

      {/* 任务列表 */}
      <div className="p-4 space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
              border border-transparent hover:border-cyan-500/15 hover:bg-cyan-500/[0.02]
              transition-all text-left group"
          >
            {/* 勾选框 */}
            <div
              className={`
                w-4 h-4 rounded border shrink-0 flex items-center justify-center
                transition-all text-[10px]
                ${
                  task.done
                    ? "bg-cyan-400/20 border-cyan-500/40 text-cyan-400"
                    : "border-zinc-700 text-transparent group-hover:border-zinc-500"
                }
              `}
            >
              ✓
            </div>
            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div
                className={`text-xs font-mono truncate ${
                  task.done ? "text-zinc-600 line-through" : "text-zinc-300"
                }`}
              >
                {task.title}
              </div>
              <div className="text-[10px] text-zinc-700">{task.category}</div>
            </div>
            {/* XP */}
            <span
              className={`text-[10px] font-mono shrink-0 ${
                task.done ? "text-cyan-500/40" : "text-yellow-500/70"
              }`}
            >
              +{task.xp} XP
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- AI 推荐路径 ---------- */
function AIPathCard() {
  return (
    <div className="cyber-card rounded-xl border border-cyan-500/15 hover:border-cyan-500/30 transition-all">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">◈</span>
          <h3 className="font-bold text-sm tracking-wide">
            AI 推荐<span className="text-cyan-400">路径</span>
          </h3>
        </div>
        <span className="font-mono text-[10px] text-cyan-500/40 border border-cyan-500/15 rounded px-1.5 py-0.5">
          AI-POWERED
        </span>
      </div>

      {/* 路径步骤 */}
      <div className="p-4 space-y-0">
        {AI_PATH.map((item, idx) => (
          <div key={item.step} className="flex gap-3">
            {/* 左侧时间线 */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center
                  text-[10px] font-mono font-bold shrink-0
                  ${
                    item.status === "completed"
                      ? "bg-cyan-400/15 border-cyan-500/50 text-cyan-400"
                      : item.status === "current"
                      ? "bg-cyan-400/10 border-cyan-400 text-cyan-400 animate-pulse-glow"
                      : "bg-zinc-900 border-zinc-700 text-zinc-600"
                  }
                `}
              >
                {item.status === "completed" ? "✓" : item.step}
              </div>
              {idx < AI_PATH.length - 1 && (
                <div
                  className={`w-px h-8 ${
                    item.status === "completed" ? "bg-cyan-500/30" : "bg-zinc-800"
                  }`}
                />
              )}
            </div>

            {/* 右侧内容 */}
            <div className="pb-4 min-w-0">
              <div
                className={`text-sm font-bold ${
                  item.status === "completed"
                    ? "text-zinc-500"
                    : item.status === "current"
                    ? "text-cyan-400"
                    : "text-zinc-600"
                }`}
              >
                {item.title}
              </div>
              <div className="text-[10px] text-zinc-700 font-mono mt-0.5">
                {item.desc}
              </div>
              {item.status === "current" && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-breathe" />
                  <span className="text-[10px] font-mono text-cyan-500/70">
                    IN PROGRESS
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 技能树 ---------- */
function SkillTreeCard() {
  const branches = useMemo(() => {
    const map: Record<string, SkillNode[]> = {};
    SKILL_TREE.forEach((node) => {
      if (!map[node.branch]) map[node.branch] = [];
      map[node.branch].push(node);
    });
    return map;
  }, []);

  const branchLabels: Record<string, string> = {
    web: "Web 安全",
    net: "网络攻防",
    pentest: "渗透测试",
    crypto: "密码学",
    reverse: "逆向",
    ai: "AI 安全",
  };

  return (
    <div className="cyber-card rounded-xl border border-cyan-500/15 hover:border-cyan-500/30 transition-all">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">◎</span>
          <h3 className="font-bold text-sm tracking-wide">
            技能<span className="text-cyan-400">树</span>
          </h3>
        </div>
        <span className="font-mono text-[10px] text-zinc-600">
          {SKILL_TREE.filter((s) => s.unlocked).length}/{SKILL_TREE.length} UNLOCKED
        </span>
      </div>

      {/* 分支 */}
      <div className="p-4 space-y-4">
        {Object.entries(branches).map(([branch, nodes]) => (
          <div key={branch}>
            <div className="font-mono text-[10px] text-zinc-600 mb-2 tracking-wider">
              {branchLabels[branch]?.toUpperCase() || branch}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {nodes.map((node) => {
                const branchColor = BRANCH_COLORS[node.branch] || "";
                return (
                  <div
                    key={node.id}
                    className={`
                      relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono
                      transition-all duration-200
                      ${
                        node.unlocked
                          ? branchColor
                          : "border-zinc-800 bg-zinc-900/50 text-zinc-700"
                      }
                    `}
                  >
                    <span className="font-bold">{node.title}</span>
                    {/* 等级点 */}
                    <div className="flex gap-0.5 ml-1">
                      {Array.from({ length: node.maxLevel }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            i < node.level
                              ? "bg-current"
                              : "bg-current/20"
                          }`}
                        />
                      ))}
                    </div>
                    {!node.unlocked && (
                      <span className="text-zinc-700 text-[8px] ml-0.5">🔒</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 成就徽章 ---------- */
function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`
        flex flex-col items-center gap-1.5 p-3 rounded-xl border
        transition-all duration-300 cursor-default
        ${RARITY_COLORS[achievement.rarity]}
        ${RARITY_GLOW[achievement.rarity]}
        ${achievement.unlocked ? "opacity-100" : "opacity-40 grayscale"}
      `}
    >
      <div
        className={`text-2xl transition-transform duration-300 ${
          achievement.unlocked ? "group-hover:scale-110" : ""
        }`}
      >
        {achievement.icon}
      </div>
      <div className="text-center">
        <div className="text-[10px] font-bold font-mono leading-tight">
          {achievement.title}
        </div>
        <div className="text-[8px] font-mono text-zinc-600 mt-0.5 leading-tight max-w-[80px]">
          {achievement.desc}
        </div>
      </div>
      {/* 稀有度标签 */}
      <span
        className={`text-[8px] font-mono border rounded px-1 py-0.5 ${RARITY_COLORS[achievement.rarity]}`}
      >
        {achievement.rarity === "common" && "普通"}
        {achievement.rarity === "rare" && "稀有"}
        {achievement.rarity === "epic" && "史诗"}
        {achievement.rarity === "legendary" && "传说"}
      </span>
    </div>
  );
}

/* ---------- 学习统计总览 ---------- */
function StatsBar() {
  const totalProgress = Math.round(
    LEARN_MODULES.reduce((sum, m) => sum + m.progress, 0) / LEARN_MODULES.length
  );
  const totalLessons = LEARN_MODULES.reduce((sum, m) => sum + m.lessons, 0);
  const completedLessons = Math.round(
    LEARN_MODULES.reduce((sum, m) => sum + m.lessons * (m.progress / 100), 0)
  );

  const stats = [
    { label: "总进度", value: `${totalProgress}%`, accent: true },
    { label: "已完成", value: `${completedLessons}`, accent: false },
    { label: "总课时", value: `${totalLessons}`, accent: false },
    { label: "连续学习", value: "7 天", accent: false },
    { label: "经验值", value: "2,450 XP", accent: true },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2">
          <div>
            <div
              className={`text-sm font-bold font-mono ${
                stat.accent ? "text-cyan-400" : "text-zinc-300"
              }`}
            >
              {stat.value}
            </div>
            <div className="text-[10px] font-mono text-zinc-600">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ======================================================================
   主页面
   ====================================================================== */

export default function LearnPage() {
  const [mounted, setMounted] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleContent | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* 点击模块卡片 → 打开文档 */
  const handleModuleClick = (moduleId: string) => {
    const content = getModuleContent(moduleId);
    if (content) setActiveModule(content);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black">
        {/* ===== Hero 区域 ===== */}
        <section className="relative border-b border-cyan-500/15 overflow-hidden">
          <ScanBackground />

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 sm:py-16">
            {/* 系统标识 */}
            <div className="font-mono text-[10px] text-cyan-500/50 tracking-[0.4em] mb-4">
              [ CYBER LEARNING CENTER ]
            </div>

            {/* 标题 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              <span className="text-cyan-400">Cyber</span> Learning Center
            </h1>

            {/* 副标题 */}
            <p className="mt-3 text-zinc-500 text-sm sm:text-base max-w-lg leading-relaxed">
              AI 驱动的网络安全学习体系，从零基础到安全专家的完整成长路径
            </p>

            {/* 分隔线 */}
            <div className="mt-5 w-24 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />

            {/* 统计 */}
            <div className="mt-6">
              <StatsBar />
            </div>
          </div>
        </section>

        {/* ===== 分类模块区 ===== */}
        <section className="max-w-6xl mx-auto px-6 py-10">
          {/* 区域标题 */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-cyan-400">⬡</span>
            <h2 className="text-lg font-bold tracking-wide">
              学习<span className="text-cyan-400">模块</span>
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent ml-3" />
          </div>

          {/* 卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {LEARN_MODULES.map((mod) => (
              <ModuleCard key={mod.id} module={mod} onClick={() => handleModuleClick(mod.id)} />
            ))}
          </div>
        </section>

        {/* ===== AI 路径 + 今日任务 + 技能树 (三栏) ===== */}
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-cyan-400">◈</span>
            <h2 className="text-lg font-bold tracking-wide">
              学习<span className="text-cyan-400">规划</span>
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent ml-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <AIPathCard />
            <DailyTasksCard />
            <SkillTreeCard />
          </div>
        </section>

        {/* ===== 成就徽章 ===== */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-cyan-400">✦</span>
            <h2 className="text-lg font-bold tracking-wide">
              成就<span className="text-cyan-400">徽章</span>
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent ml-3" />
            <span className="font-mono text-[10px] text-zinc-600">
              {ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length} UNLOCKED
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {ACHIEVEMENTS.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </section>

        {/* ===== 文档阅读器 ===== */}
        {activeModule && (
          <LessonViewer
            module={activeModule}
            onClose={() => setActiveModule(null)}
          />
        )}

        {/* ===== 底部 ===== */}
        <footer className="border-t border-cyan-500/10 px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="font-mono text-[10px] text-zinc-700">
              © 2025 CyberVerse AI — Learning Module v2.0
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-breathe" />
              <span>ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </footer>
      </div>
  );
}
