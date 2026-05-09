"use client";

import ShellLayout from "@/components/Shell/layout";
import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

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

      const assistantId = `msg-${Date.now()}-ai`;
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

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
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + parsed.content }
                      : m
                  )
                );
              }
            } catch {
              // 非 JSON 数据，作为纯文本追加
              if (data.trim()) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + data }
                      : m
                  )
                );
              }
            }
          }
        }
      }
    } catch (error) {
      const errMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: `[系统错误] 连接 AI 助手失败，请稍后重试。Error: ${error instanceof Error ? error.message : "Unknown"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  if (!mounted) return null;

  return (
    <ShellLayout>
      <div className="flex flex-col h-screen bg-black">
        {/* ===== 顶栏 ===== */}
        <header className="shrink-0 border-b border-cyan-500/15 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-breathe" />
            <h1 className="text-lg font-bold tracking-wide text-cyan-400">
              AI 安全助手
            </h1>
            <span className="font-mono text-[10px] text-zinc-600 border border-zinc-800 rounded px-1.5 py-0.5">
              ONLINE
            </span>
          </div>
          <p className="text-zinc-600 text-xs mt-1 font-mono">
            询问任何网络安全问题 — 渗透测试、漏洞分析、安全加固
          </p>
        </header>

        {/* ===== 消息区 ===== */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-4">◈</div>
              <h2 className="text-xl font-bold text-zinc-400 mb-2">
                安全对话就绪
              </h2>
              <p className="text-zinc-600 text-sm max-w-md">
                输入你的安全问题，AI 助手将为你提供专业的网络安全建议与分析。
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "如何防御 SQL 注入攻击？",
                  "XSS 和 CSRF 有什么区别？",
                  "解释零信任安全架构",
                  "如何进行渗透测试？",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="text-left text-xs font-mono text-zinc-500 border border-cyan-500/15 rounded-lg px-3 py-2.5 hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all"
                  >
                    <span className="text-cyan-600 mr-1">&gt;</span> {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[85%] sm:max-w-[70%] rounded-lg px-4 py-3 text-sm leading-relaxed
                  ${
                    msg.role === "user"
                      ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100"
                      : "bg-zinc-900/80 border border-zinc-800 text-zinc-300 font-mono"
                  }
                `}
              >
                {/* 角色标识 */}
                <div
                  className={`text-[10px] font-mono mb-1.5 ${
                    msg.role === "user" ? "text-cyan-500" : "text-green-500"
                  }`}
                >
                  {msg.role === "user" ? "YOU" : "AI-ASSISTANT"}
                </div>
                {/* 消息内容 */}
                <div className="whitespace-pre-wrap break-words">
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="animate-breathe">●</span>
                      <span className="animate-breathe" style={{ animationDelay: "0.2s" }}>●</span>
                      <span className="animate-breathe" style={{ animationDelay: "0.4s" }}>●</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ===== 输入区 ===== */}
        <div className="shrink-0 border-t border-cyan-500/15 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-4">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入安全问题..."
                rows={1}
                className="w-full bg-black/60 border border-cyan-500/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_#00f0ff15] resize-none font-mono transition-all"
                style={{ minHeight: "44px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={`
                shrink-0 h-11 px-6 rounded-lg font-bold text-sm tracking-wide transition-all
                ${
                  input.trim() && !isLoading
                    ? "bg-cyan-400 text-black hover:shadow-[0_0_20px_#00f0ff40] hover:scale-105"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }
              `}
            >
              {isLoading ? "..." : "发送"}
            </button>
          </div>
          <div className="mt-2 font-mono text-[10px] text-zinc-700 text-center">
            ENTER 发送 / SHIFT+ENTER 换行
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
