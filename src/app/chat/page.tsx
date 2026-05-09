"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/* ======================================================================
   类型定义
   ====================================================================== */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

/* ======================================================================
   常量
   ====================================================================== */

const QUICK_QUESTIONS = [
  { icon: "⬡", text: "如何防御 SQL 注入攻击？", tag: "WEB" },
  { icon: "◈", text: "XSS 和 CSRF 有什么区别？", tag: "VULN" },
  { icon: "◎", text: "解释零信任安全架构", tag: "ARCH" },
  { icon: "▸", text: "如何进行渗透测试？", tag: "PENTEST" },
  { icon: "◉", text: "什么是 AES-256 加密？", tag: "CRYPTO" },
  { icon: "✦", text: "AI 对抗样本攻击原理？", tag: "AI-Sec" },
] as const;

/* ======================================================================
   工具函数
   ====================================================================== */

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractTitle(text: string): string {
  const clean = text.replace(/[\n\r]/g, " ").trim();
  return clean.length > 24 ? `${clean.slice(0, 24)}...` : clean;
}

/* ======================================================================
   AI 思考动画组件
   ====================================================================== */

function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* AI 头像 */}
      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
        <span className="text-cyan-400 text-sm font-bold font-mono">AI</span>
      </div>
      <div className="flex items-center gap-2 py-2">
        {/* 脑波动画 */}
        <div className="flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-cyan-400 rounded-full animate-breathe"
              style={{
                height: `${8 + i * 3}px`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        <span className="text-cyan-500/70 text-xs font-mono ml-2">
          ANALYZING...
        </span>
      </div>
    </div>
  );
}

/* ======================================================================
   Markdown 代码块 - 复制按钮
   ====================================================================== */

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [codeText]);

  return (
    <div className="relative group my-3">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between bg-zinc-900 border border-cyan-500/15 rounded-t-lg px-4 py-1.5">
        <span className="text-[10px] font-mono text-zinc-500">
          {className?.replace("language-", "") || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-[10px] font-mono text-zinc-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
        >
          {copied ? (
            <>
              <span className="text-green-400">✓</span> COPIED
            </>
          ) : (
            "COPY"
          )}
        </button>
      </div>
      {/* 代码内容 */}
      <pre className="!mt-0 !rounded-t-none border border-t-0 border-cyan-500/10 bg-[#0d0d12] overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

/* ======================================================================
   消息内容 Markdown 渲染
   ====================================================================== */

function MessageContent({ content }: { content: string }) {
  const components = useMemo(
    () => ({
      code({
        className,
        children,
        ...props
      }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
        const isInline = !className;
        if (isInline) {
          return (
            <code
              className="bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono"
              {...props}
            >
              {children}
            </code>
          );
        }
        return <CodeBlock className={className}>{children}</CodeBlock>;
      },
      p({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
        return (
          <p className="mb-3 last:mb-0 leading-relaxed" {...props}>
            {children}
          </p>
        );
      },
      ul({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
        return (
          <ul className="list-disc list-inside mb-3 space-y-1" {...props}>
            {children}
          </ul>
        );
      },
      ol({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) {
        return (
          <ol className="list-decimal list-inside mb-3 space-y-1" {...props}>
            {children}
          </ol>
        );
      },
      li({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
        return (
          <li className="leading-relaxed" {...props}>
            {children}
          </li>
        );
      },
      h1({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
        return (
          <h1
            className="text-lg font-bold text-cyan-400 mb-3 mt-4"
            {...props}
          >
            {children}
          </h1>
        );
      },
      h2({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
        return (
          <h2
            className="text-base font-bold text-cyan-400 mb-2 mt-3"
            {...props}
          >
            {children}
          </h2>
        );
      },
      h3({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
        return (
          <h3
            className="text-sm font-bold text-cyan-400/80 mb-2 mt-3"
            {...props}
          >
            {children}
          </h3>
        );
      },
      blockquote({
        children,
        ...props
      }: React.HTMLAttributes<HTMLQuoteElement>) {
        return (
          <blockquote
            className="border-l-2 border-cyan-500/40 pl-3 my-3 text-zinc-400 italic"
            {...props}
          >
            {children}
          </blockquote>
        );
      },
      a({
        children,
        href,
        ...props
      }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            {...props}
          >
            {children}
          </a>
        );
      },
      table({
        children,
        ...props
      }: React.HTMLAttributes<HTMLTableElement>) {
        return (
          <div className="overflow-x-auto my-3">
            <table
              className="min-w-full border border-cyan-500/15 rounded-lg text-sm"
              {...props}
            >
              {children}
            </table>
          </div>
        );
      },
      th({
        children,
        ...props
      }: React.ThHTMLAttributes<HTMLTableCellElement>) {
        return (
          <th
            className="border border-cyan-500/15 bg-cyan-500/5 px-3 py-2 text-left font-mono text-xs text-cyan-400"
            {...props}
          >
            {children}
          </th>
        );
      },
      td({
        children,
        ...props
      }: React.TdHTMLAttributes<HTMLTableCellElement>) {
        return (
          <td
            className="border border-cyan-500/10 px-3 py-2 text-zinc-300"
            {...props}
          >
            {children}
          </td>
        );
      },
      hr({ ...props }: React.HTMLAttributes<HTMLHRElement>) {
        return (
          <hr
            className="border-cyan-500/15 my-4"
            {...props}
          />
        );
      },
      strong({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
        return (
          <strong className="text-cyan-300 font-semibold" {...props}>
            {children}
          </strong>
        );
      },
    }),
    []
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}

/* ======================================================================
   主聊天页面组件
   ====================================================================== */

export default function ChatPage() {
  /* ---------- 状态 ---------- */
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /* ---------- 派生状态 ---------- */
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId]
  );

  const messages = activeSession?.messages ?? [];

  /* ---------- 初始化 ---------- */
  useEffect(() => {
    setMounted(true);
    createNewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- 自动滚动 ---------- */
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /* ---------- 创建新会话 ---------- */
  const createNewSession = useCallback(() => {
    const id = generateId();
    const newSession: ChatSession = {
      id,
      title: "新对话",
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
    setInput("");
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  /* ---------- 删除会话 ---------- */
  const deleteSession = useCallback(
    (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== sessionId);
        if (sessionId === activeSessionId && remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else if (remaining.length === 0) {
          const id = generateId();
          const newSession: ChatSession = {
            id,
            title: "新对话",
            messages: [],
            createdAt: Date.now(),
          };
          remaining.push(newSession);
          setActiveSessionId(id);
        }
        return remaining;
      });
    },
    [activeSessionId]
  );

  /* ---------- 发送消息 ---------- */
  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title:
                s.messages.length === 0 ? extractTitle(trimmed) : s.title,
              messages: [...s.messages, userMsg],
            }
          : s
      )
    );

    setInput("");
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const assistantId = generateId();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );

      setIsLoading(false);

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === activeSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantId
                              ? { ...m, content: m.content + parsed.content }
                              : m
                          ),
                        }
                      : s
                  )
                );
              }
            } catch {
              if (data.trim()) {
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === activeSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantId
                              ? { ...m, content: m.content + data }
                              : m
                          ),
                        }
                      : s
                  )
                );
              }
            }
          }
        }
      }
    } catch (error) {
      const errMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: `[系统错误] 连接 AI 助手失败，请稍后重试。\n\`\`\`\nError: ${error instanceof Error ? error.message : "Unknown"}\n\`\`\``,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, errMsg] }
            : s
        )
      );
      setIsLoading(false);
    } finally {
      setIsStreaming(false);
    }
  }, [input, isLoading, activeSessionId]);

  /* ---------- 键盘事件 ---------- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  /* ---------- 快捷提问 ---------- */
  const handleQuickQuestion = useCallback(
    (question: string) => {
      setInput(question);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    []
  );

  /* ---------- SSR 守卫 ---------- */
  if (!mounted) return null;

  /* ====================================================================
     渲染
     ==================================================================== */

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* ===== 左侧历史会话栏 ===== */}
      {/* 桌面端常驻 / 移动端抽屉 */}
      <aside
        className={`
          shrink-0 w-64 border-r border-cyan-500/15 bg-zinc-950/95 backdrop-blur-md
          flex flex-col
          fixed md:relative inset-y-0 left-0 z-50
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* 新建会话按钮 */}
        <div className="p-3 border-b border-cyan-500/10">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
              border border-cyan-500/30 text-cyan-400 text-sm font-mono
              hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all"
          >
            <span className="text-base">+</span>
            <span>新对话</span>
          </button>
        </div>

        {/* 会话列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                setActiveSessionId(session.id);
                setSidebarOpen(false);
              }}
              className={`
                group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer
                transition-all duration-200
                ${
                  session.id === activeSessionId
                    ? "bg-cyan-500/10 border border-cyan-500/25 text-cyan-300"
                    : "border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }
              `}
            >
              <span className="text-xs shrink-0">
                {session.id === activeSessionId ? "◈" : "○"}
              </span>
              <span className="text-xs font-mono truncate flex-1">
                {session.title}
              </span>
              <button
                onClick={(e) => deleteSession(session.id, e)}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400
                  transition-all text-xs shrink-0 w-5 h-5 flex items-center justify-center rounded
                  hover:bg-red-500/10"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* 底部信息 */}
        <div className="p-3 border-t border-cyan-500/10">
          <div className="font-mono text-[10px] text-zinc-700 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-breathe" />
              <span>AI-ENGINE: ACTIVE</span>
            </div>
            <div>SESSIONS: {sessions.length}</div>
          </div>
        </div>
      </aside>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== 中间主聊天区 ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ---- 顶栏 ---- */}
        <header className="shrink-0 border-b border-cyan-500/15 bg-zinc-950/80 backdrop-blur-md px-4 py-3 flex items-center gap-3">
          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-8 h-8 flex items-center justify-center border border-cyan-500/20
              rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition"
          >
            <span className="font-mono text-sm">☰</span>
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-breathe" />
            <h1 className="text-sm font-bold tracking-wide text-cyan-400 truncate">
              {activeSession?.title || "AI 安全助手"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isStreaming && (
              <span className="font-mono text-[10px] text-cyan-500/70 border border-cyan-500/20 rounded px-2 py-0.5">
                STREAMING
              </span>
            )}
            <span className="font-mono text-[10px] text-zinc-600 border border-zinc-800 rounded px-2 py-0.5">
              ONLINE
            </span>
          </div>
        </header>

        {/* ---- 消息区域 ---- */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            {/* 空状态 - 快捷提问 */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                {/* 装饰 */}
                <div className="relative mb-6">
                  <div className="text-5xl text-cyan-400/30">◈</div>
                  <div className="absolute inset-0 text-5xl text-cyan-400 animate-breathe">
                    ◈
                  </div>
                </div>

                <h2 className="text-xl font-bold text-zinc-300 mb-2">
                  安全对话就绪
                </h2>
                <p className="text-zinc-600 text-sm max-w-md mb-8">
                  输入你的安全问题，AI 助手将为你提供专业的网络安全建议与分析
                </p>

                {/* 快捷提问网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q.text}
                      onClick={() => handleQuickQuestion(q.text)}
                      className="group text-left border border-cyan-500/15 rounded-xl px-4 py-3
                        hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-500/60 text-sm group-hover:text-cyan-400 transition-colors">
                          {q.icon}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-600 border border-zinc-800 rounded px-1.5 py-0.5">
                          {q.tag}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-zinc-500 group-hover:text-cyan-400 transition-colors">
                        <span className="text-cyan-600 mr-1">&gt;</span>
                        {q.text}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 终端装饰 */}
                <div className="mt-10 font-mono text-[10px] text-zinc-700 space-y-0.5">
                  <div>$ security-assistant --init</div>
                  <div className="text-cyan-500/40">
                    [+] AI engine loaded. Ready for queries.
                  </div>
                </div>
              </div>
            )}

            {/* 消息列表 */}
            {messages.map((msg) => (
              <div key={msg.id} className="group">
                {msg.role === "user" ? (
                  /* ===== 用户消息 ===== */
                  <div className="flex justify-end">
                    <div className="max-w-[85%] sm:max-w-[70%]">
                      <div className="flex items-center justify-end gap-2 mb-1.5">
                        <span className="font-mono text-[10px] text-cyan-500/60">
                          YOU
                        </span>
                        <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <span className="text-[10px] text-cyan-400 font-bold font-mono">
                            U
                          </span>
                        </div>
                      </div>
                      <div className="bg-cyan-500/8 border border-cyan-500/15 rounded-xl rounded-tr-sm px-4 py-3 text-sm text-cyan-100">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ===== AI 消息 ===== */
                  <div className="flex justify-start">
                    <div className="max-w-[90%] sm:max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                          <span className="text-[10px] text-cyan-400 font-bold font-mono">
                            AI
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-cyan-500/60">
                          AI-ASSISTANT
                        </span>
                      </div>
                      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl rounded-tl-sm px-4 py-3 text-sm text-zinc-300">
                        {/* 打字机光标 - 流式输出时显示 */}
                        {msg.content === "" ? (
                          <div className="flex items-center gap-1 py-1">
                            <span className="animate-blink-cursor text-cyan-400 text-lg">
                              ▌
                            </span>
                          </div>
                        ) : (
                          <MessageContent content={msg.content} />
                        )}
                        {/* 流式输出尾随光标 */}
                        {isStreaming &&
                          msg.id === messages[messages.length - 1]?.id &&
                          msg.role === "assistant" &&
                          msg.content !== "" && (
                            <span className="animate-blink-cursor text-cyan-400 text-sm ml-0.5">
                              ▌
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 思考动画 */}
            {isLoading && <ThinkingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ---- 输入区 ---- */}
        <div className="shrink-0 border-t border-cyan-500/10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-3xl mx-auto">
            <div
              className="relative rounded-xl border border-cyan-500/20
                bg-zinc-950/70 backdrop-blur-xl
                shadow-[0_0_30px_#00f0ff08]
                focus-within:border-cyan-500/40 focus-within:shadow-[0_0_30px_#00f0ff15]
                transition-all duration-300"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入安全问题..."
                rows={1}
                disabled={isLoading}
                className="w-full bg-transparent px-4 py-3 pr-24 text-sm text-white
                  placeholder:text-zinc-600 resize-none font-mono
                  focus:outline-none disabled:opacity-50
                  max-h-[120px]"
                style={{ minHeight: "44px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />

              {/* 右侧操作 */}
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-700 hidden sm:inline">
                  ENTER ↵
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  className={`
                    px-4 py-1.5 rounded-lg font-bold text-xs tracking-wide
                    transition-all duration-200
                    ${
                      input.trim() && !isLoading
                        ? "bg-cyan-400 text-black hover:shadow-[0_0_20px_#00f0ff40] hover:scale-105"
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }
                  `}
                >
                  {isLoading ? "..." : "SEND"}
                </button>
              </div>
            </div>

            {/* 底部提示 */}
            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-zinc-700">
              <span>ENTER 发送 / SHIFT+ENTER 换行</span>
              <span>POWERED BY CYBERVERSE AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
