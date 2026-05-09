"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ModuleContent, Lesson, LessonSection } from "@/data/learnContent";

/* ======================================================================
   Props
   ====================================================================== */
interface LessonViewerProps {
  module: ModuleContent;
  onClose: () => void;
}

/* ======================================================================
   样式映射
   ====================================================================== */
const DIFF_COLORS: Record<string, string> = {
  入门: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  进阶: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  高级: "bg-red-500/10 text-red-400 border-red-500/30",
  前沿: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

/* ======================================================================
   Section 渲染器
   ====================================================================== */
function SectionRenderer({ section, index }: { section: LessonSection; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(section.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [section.content]);

  switch (section.type) {
    case "text":
      return (
        <p
          className="text-zinc-400 text-sm leading-relaxed"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          {section.content}
        </p>
      );

    case "code":
      return (
        <div className="rounded-lg border border-cyan-500/15 overflow-hidden group">
          {/* 头部 */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 border-b border-cyan-500/10">
            <span className="font-mono text-[10px] text-cyan-500/50">
              {section.lang?.toUpperCase() || "CODE"}
            </span>
            <button
              onClick={handleCopy}
              className="font-mono text-[10px] px-2 py-0.5 rounded border transition-all
                border-cyan-500/20 text-cyan-500/50 hover:text-cyan-400 hover:border-cyan-500/40"
            >
              {copied ? "COPIED ✓" : "COPY"}
            </button>
          </div>
          {/* 代码 */}
          <pre className="p-3 overflow-x-auto bg-black/50">
            <code className="font-mono text-[12px] leading-relaxed text-green-400/90 whitespace-pre">
              {section.content}
            </code>
          </pre>
        </div>
      );

    case "warning":
      return (
        <div className="flex gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/[0.03]">
          <span className="text-red-400 text-sm shrink-0 mt-0.5">⚠</span>
          <p className="text-red-300/80 text-sm leading-relaxed">{section.content}</p>
        </div>
      );

    case "tip":
      return (
        <div className="flex gap-3 p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.03]">
          <span className="text-cyan-400 text-sm shrink-0 mt-0.5">💡</span>
          <p className="text-cyan-300/80 text-sm leading-relaxed">{section.content}</p>
        </div>
      );

    case "list":
      return (
        <div className="space-y-1.5">
          {section.content && (
            <div className="font-mono text-[11px] text-cyan-400/70 tracking-wider mb-2">
              ▸ {section.content}
            </div>
          )}
          <ul className="space-y-1.5">
            {section.items?.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-400 leading-relaxed">
                <span className="text-cyan-500/50 shrink-0 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-cyan-500/15">
          {section.content && (
            <div className="px-3 py-2 border-b border-cyan-500/10 bg-zinc-900/50">
              <span className="font-mono text-[11px] text-cyan-400/70">{section.content}</span>
            </div>
          )}
          <table className="w-full text-sm">
            <tbody>
              {section.rows?.map((row, ri) => (
                <tr
                  key={ri}
                  className={
                    ri === 0
                      ? "bg-cyan-500/[0.05] border-b border-cyan-500/10"
                      : "border-b border-zinc-800/50 last:border-0"
                  }
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-3 py-2 font-mono text-[12px] ${
                        ri === 0 ? "text-cyan-400/80 font-bold" : "text-zinc-400"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

/* ======================================================================
   LessonViewer 主组件
   ====================================================================== */
export default function LessonViewer({ module, onClose }: LessonViewerProps) {
  const [activeLesson, setActiveLesson] = useState<Lesson>(module.lessons[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* 切换课程时滚动到顶部 */
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeLesson.id]);

  /* ESC 关闭 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/95 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      {/* ===== 左侧课程目录 ===== */}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-0"} overflow-hidden
          border-r border-cyan-500/15 bg-zinc-950/90
          transition-all duration-300 shrink-0
          max-md:absolute max-md:z-10 max-md:h-full
          max-md:${sidebarOpen ? "w-64" : "w-0"}
        `}
      >
        <div className="w-64 h-full flex flex-col">
          {/* 模块标题 */}
          <div className="p-4 border-b border-cyan-500/10">
            <button
              onClick={onClose}
              className="text-zinc-600 hover:text-cyan-400 transition-colors text-xs font-mono mb-2 flex items-center gap-1"
            >
              <span>←</span> 返回学习中心
            </button>
            <h2 className="text-sm font-bold text-cyan-400 tracking-wide">
              {module.title}
            </h2>
            <div className="font-mono text-[10px] text-zinc-600 mt-1">
              {module.lessons.length} 课时
            </div>
          </div>

          {/* 课程列表 */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {module.lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200
                  ${
                    activeLesson.id === lesson.id
                      ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                      : "border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                  }
                `}
              >
                <div className="font-mono text-[11px] font-bold truncate">
                  {lesson.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[9px] px-1 py-0.5 border rounded ${DIFF_COLORS[lesson.difficulty]}`}
                  >
                    {lesson.difficulty}
                  </span>
                  <span className="text-[9px] text-zinc-700 font-mono">
                    {lesson.duration}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* ===== 右侧内容区 ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部工具栏 */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-cyan-500/10 bg-zinc-950/50 shrink-0">
          {/* 侧边栏切换 */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-500 hover:text-cyan-400 transition-colors p-1"
            title="切换目录"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-zinc-200 truncate">
              {activeLesson.title}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span
                className={`text-[9px] px-1.5 py-0.5 border rounded font-mono ${DIFF_COLORS[activeLesson.difficulty]}`}
              >
                {activeLesson.difficulty}
              </span>
              <span className="text-[10px] text-zinc-600 font-mono">
                {activeLesson.duration}
              </span>
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-red-400 transition-colors p-1"
            title="关闭 (ESC)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* 内容滚动区 */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            {/* 学习目标 */}
            <div className="rounded-xl border border-cyan-500/15 p-4 bg-cyan-500/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-cyan-400 text-xs">◈</span>
                <h3 className="font-mono text-[11px] text-cyan-400/80 tracking-wider">
                  LEARNING OBJECTIVES
                </h3>
              </div>
              <ul className="space-y-2">
                {activeLesson.objectives.map((obj, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <span className="text-cyan-500/50 shrink-0">▸</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 章节内容 */}
            {activeLesson.sections.map((section, i) => (
              <SectionRenderer key={i} section={section} index={i} />
            ))}

            {/* 分隔线 */}
            <div className="border-t border-cyan-500/10 my-8" />

            {/* 关键要点 */}
            <div className="rounded-xl border border-green-500/15 p-4 bg-green-500/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-400 text-xs">✦</span>
                <h3 className="font-mono text-[11px] text-green-400/80 tracking-wider">
                  KEY TAKEAWAYS
                </h3>
              </div>
              <ul className="space-y-2">
                {activeLesson.keyTakeaways.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <span className="text-green-500/50 shrink-0">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 实战练习 */}
            <div className="rounded-xl border border-yellow-500/15 p-4 bg-yellow-500/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400 text-xs">◈</span>
                <h3 className="font-mono text-[11px] text-yellow-400/80 tracking-wider">
                  PRACTICE EXERCISE
                </h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {activeLesson.practice}
              </p>
            </div>

            {/* 导航到上一节/下一节 */}
            <div className="flex items-center justify-between pt-6 pb-8">
              {(() => {
                const idx = module.lessons.findIndex((l) => l.id === activeLesson.id);
                const prev = idx > 0 ? module.lessons[idx - 1] : null;
                const next = idx < module.lessons.length - 1 ? module.lessons[idx + 1] : null;
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => setActiveLesson(prev)}
                        className="flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-colors"
                      >
                        <span>←</span> {prev.title}
                      </button>
                    ) : (
                      <div />
                    )}
                    {next ? (
                      <button
                        onClick={() => setActiveLesson(next)}
                        className="flex items-center gap-1 text-xs font-mono text-cyan-500/70 hover:text-cyan-400 transition-colors"
                      >
                        {next.title} <span>→</span>
                      </button>
                    ) : (
                      <div className="text-xs font-mono text-zinc-700">已到最后一课</div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
