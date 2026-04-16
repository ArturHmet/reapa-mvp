"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, Loader2, RefreshCw } from "lucide-react";

const QUICK_PROMPTS = [
  "📊 Summarize my hot leads",
  "✅ What tasks are due today?",
  "📝 Draft a follow-up WhatsApp for a warm lead",
  "🏠 Write a listing description for a 3BR apartment in Sliema",
  "⚖️ What AML documents do I need?",
  "📈 What's selling in St Julian's right now?",
];

export function REAPACopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, setMessages } =
    useChat({
      api: "/api/ai/chat",
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hi! I'm REAPA, your AI real estate assistant. I can help you with leads, follow-ups, listings, compliance, and market insights.\n\nWhat do you need?",
        },
      ],
    });

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleQuickPrompt = (prompt: string) => {
    const cleaned = prompt.replace(/^[^a-zA-Z]+/, "");
    handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>, {
      options: { body: { messages: [...messages, { role: "user", content: cleaned }] } },
      data: undefined,
      allowEmptySubmit: false,
    });
    // Directly set input and submit
    const syntheticInput = { target: { value: cleaned } } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticInput);
    setTimeout(() => {
      const form = document.querySelector("#reapa-copilot-form") as HTMLFormElement;
      form?.requestSubmit();
    }, 50);
  };

  const sizeClasses = isExpanded
    ? "w-[700px] h-[80vh] bottom-4 right-4"
    : "w-[380px] h-[580px] bottom-4 right-4";

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-blue-500/30 transition-all duration-200 hover:scale-105 group"
        aria-label="Open REAPA AI Copilot"
      >
        <Sparkles size={18} className="animate-pulse" />
        <span className="text-sm font-semibold">REAPA Copilot</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl shadow-black/40 transition-all duration-200 ${sizeClasses} ${isMinimized ? "h-14" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] flex-shrink-0 rounded-t-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[var(--text)]">REAPA Copilot</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-[var(--text-muted)]">Gemini 2.0 Flash</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-colors text-[var(--text-muted)] hidden sm:block"
            title={isExpanded ? "Shrink" : "Expand"}
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-colors text-[var(--text-muted)]"
            title={isMinimized ? "Restore" : "Minimize"}
          >
            <Minimize2 size={13} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-colors text-[var(--text-muted)]"
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                    <Bot size={11} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-[var(--bg-card)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={11} className="text-white" />
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <span>AI unavailable — add API keys to environment</span>
                <button onClick={reload} className="ml-auto hover:text-red-300">
                  <RefreshCw size={12} />
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (only when few messages) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {QUICK_PROMPTS.slice(0, 4).map((p) => (
                <button
                  key={p}
                  onClick={() => handleQuickPrompt(p)}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-blue-500/40 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-[var(--border)] flex-shrink-0">
            <form
              id="reapa-copilot-form"
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-3 py-2 focus-within:border-blue-500/50 transition-colors"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask REAPA anything..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 size={12} className="text-white animate-spin" />
                ) : (
                  <Send size={12} className="text-white" />
                )}
              </button>
            </form>
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-1.5">
              Powered by Google Gemini · REAPA AI
            </p>
          </div>
        </>
      )}
    </div>
  );
}
