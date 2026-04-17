"use client";
import { useState, useRef, useEffect } from "react";
import { captureEvent } from "@/lib/posthog";
import { useChat, type Message } from "ai/react";
import { X, Minimize2, Maximize2, Send, Bot } from "lucide-react";

const QUICK_PROMPTS = [
  "Summarize my hot leads",
  "Draft a follow-up for a cold lead",
  "What are today's priority tasks?",
  "Help me write a property description",
  "Check AML compliance checklist",
];

export function REAPACopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // UX-BETA-003: First-visit nudge — show tooltip for 8s if user hasn't opened copilot yet
  const [showNudge, setShowNudge] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowNudge(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/ai/chat",
    onError: (err) => console.error("[REAPACopilot]", err),
  });

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  // BUG FIX Task 5: append() only, no double-submit via form.requestSubmit()
  const handleQuickPrompt = (prompt: string) => {
    captureEvent("copilot_message_sent", {
      is_first_message: messages.length === 0,
      char_count: prompt.length,
      query_type: "quick_prompt",
    });
    append({ role: "user", content: prompt });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    captureEvent("copilot_message_sent", {
      is_first_message: messages.length === 0,
      char_count: input.trim().length,
      query_type: "typed",
    });
    handleSubmit(e);
  };

  // MOB-002: FAB — raised by safe-area-inset-bottom so it clears iOS home
  // indicator and Android gesture nav bar when viewport-fit=cover is active.
  if (!isOpen) {
    return (
      <div className="fixed right-6 z-50" style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}>
        {/* First-visit nudge bubble */}
        {showNudge && (
          <div className="absolute bottom-full right-0 mb-3 bg-[var(--bg-card)] border border-indigo-500/30 rounded-xl px-3 py-2 shadow-lg w-48 pointer-events-none">
            <p className="text-xs font-medium text-indigo-300">✨ Ask your AI assistant</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Summarize leads, draft replies, check compliance…</p>
            <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-[var(--bg-card)] border-r border-b border-indigo-500/30 rotate-45" />
          </div>
        )}
      <button
        onClick={() => { setIsOpen(true); setShowNudge(false); }}
        aria-label="Open REAPA Copilot"
        className="relative flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-105"
          >
        <Bot size={20} />
        <span className="text-sm font-medium">REAPA Copilot</span>
      </button>
    </div>
  );
  }

  return (
    <>
      {/*
       * MOB-001: semi-transparent backdrop shown only on narrow viewports (≤375px).
       * Tapping outside the bottom sheet dismisses the Copilot.
       *
       * Tailwind v4 note: max-[376px]: generates
       *   @media not all and (min-width: 376px)  ⇒  width ≤ 375px
       * Using 376 (not 375) is required to capture iPhone SE (exactly 375px).
       */}
      <div
        className="fixed inset-0 z-40 bg-black/50 hidden max-[376px]:block"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/*
       * MOB-001: layout switching
       *   ≤375px → bottom sheet: 100vw × 85svh, anchored to bottom edge,
       *            rounded top corners only, no minimize (swipe-down or ✕ to close)
       *   ≥376px → original floating panel: bottom-6 right-6, w-96 h-[560px]
       */}
      <div
        className={[
          // base
          "fixed z-50 flex flex-col bg-gray-900 border border-gray-700 shadow-2xl transition-all",
          // ≤375px: bottom sheet (max-[376px]: = @media not all and (min-width:376px) = width≤375px)
          "max-[376px]:bottom-0 max-[376px]:left-0 max-[376px]:w-full max-[376px]:rounded-t-2xl max-[376px]:rounded-b-none max-[376px]:border-x-0 max-[376px]:border-b-0",
          // ≥376px: floating panel
          "min-[376px]:right-6 min-[376px]:rounded-2xl",
          // height / width variants per state
          isMinimized
            ? "min-[376px]:bottom-6 min-[376px]:w-72 h-14"
            : "max-[376px]:h-[85svh] min-[376px]:bottom-6 min-[376px]:w-96 min-[376px]:h-[560px]",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">REAPA Copilot</p>
              {!isMinimized && (
                <p className="text-xs text-gray-400">
                  {isLoading ? "Thinking…" : "AI-powered · Responses generated by AI"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Minimize only makes sense in floating panel mode */}
            <button
              onClick={() => setIsMinimized((v) => !v)}
              className="hidden min-[376px]:flex p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close copilot"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <Bot size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Hi! I&apos;m your REAPA Copilot</p>
                    <p className="text-gray-400 text-xs mt-1">Ask me anything about your pipeline, leads, or listings.</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleQuickPrompt(p)}
                        className="text-xs text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m: Message) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/*
             * Input — MOB-002: bottom padding = normal 0.75rem + safe-area-inset-bottom.
             * On iOS this clears the home indicator; on Android it clears the
             * gesture nav bar. Falls back to 0px on devices without safe areas.
             */}
            <form
              onSubmit={handleFormSubmit}
              className="flex items-center gap-2 px-3 pt-3 border-t border-gray-700"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about leads, listings, tasks…"
                disabled={isLoading}
                className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none placeholder:text-gray-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}

// Legacy export for compatibility
export default REAPACopilot;
