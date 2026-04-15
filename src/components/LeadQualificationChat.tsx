"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Minimize2, Maximize2, Zap, Phone, Mail } from "lucide-react";

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface LeadState {
  step: number;
  score: number;
  intent?: string;
  timeline?: string;
  budget?: string;
  location?: string;
  financing?: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface LeadData {
  name?: string;
  phone?: string;
  email?: string;
  score: number;
  temperature: "hot" | "warm" | "cold" | "ice";
  intent?: string;
  budget?: string;
  location?: string;
}

const temperatureConfig = {
  hot:  { label: "HOT",  color: "text-red-500",    bg: "bg-red-500/10 border-red-500/30",     emoji: "🔥" },
  warm: { label: "WARM", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30", emoji: "🟡" },
  cold: { label: "COLD", color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30",   emoji: "🔵" },
  ice:  { label: "ICE",  color: "text-gray-400",   bg: "bg-gray-500/10 border-gray-500/30",   emoji: "⚪" },
};

export function LeadQualificationChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leadState, setLeadState] = useState<LeadState>({ step: 0, score: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [capturedLead, setCapturedLead] = useState<LeadData | null>(null);
  const [temperature, setTemperature] = useState<"hot" | "warm" | "cold" | "ice">("ice");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const initChat = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat/qualify");
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.message, timestamp: new Date() }]);
      setLeadState(data.state);
    } catch {
      setMessages([{ role: "assistant", content: "Hi! I'm REAPA, your real estate assistant. How can I help?", timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const handleOpen = () => {
    setIsOpen(true); setIsMinimized(false);
    if (messages.length === 0) initChat();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading || isComplete) return;
    const userMessage: Message = { role: "user", content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })), state: leadState }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message, timestamp: new Date() }]);
      setLeadState(data.state);
      setTemperature(data.temperature);
      if (data.isComplete) { setIsComplete(true); if (data.lead) setCapturedLead(data.lead); }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again.", timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const tempConfig = temperatureConfig[temperature];

  if (!isOpen) {
    return (
      <button onClick={handleOpen} className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50" aria-label="Open chat">
        <MessageSquare size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">AI</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ${ isMinimized ? "h-14 w-80" : "h-[600px] w-96" } rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--accent)] text-white">
        <div className="flex items-center gap-2">
          <Zap size={18} />
          <span className="font-semibold text-sm">REAPA Assistant</span>
          {!isMinimized && leadState.step > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tempConfig.bg} ${tempConfig.color}`}>{tempConfig.emoji} {tempConfig.label}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/20 rounded">{isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}</button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded"><X size={14} /></button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {leadState.score > 0 && (
            <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--background)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>Lead Score</span>
                <span className={`font-semibold ${tempConfig.color}`}>{leadState.score}/150</span>
              </div>
              <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${ temperature === "hot" ? "bg-red-500" : temperature === "warm" ? "bg-yellow-400" : temperature === "cold" ? "bg-blue-400" : "bg-gray-400" }`} style={{ width: `${Math.min((leadState.score / 150) * 100, 100)}%` }} />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${ msg.role === "user" ? "bg-[var(--accent)] text-white rounded-br-sm" : "bg-[var(--background)] border border-[var(--border)] text-[var(--text)] rounded-bl-sm" }`}>{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0,150,300].map(d => <div key={d} className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                </div>
              </div>
            )}
            {isComplete && capturedLead && (
              <div className={`rounded-xl border p-3 text-sm ${tempConfig.bg}`}>
                <div className={`font-semibold mb-1 ${tempConfig.color}`}>{tempConfig.emoji} Lead Captured — {tempConfig.label}</div>
                <div className="text-[var(--text-muted)] space-y-0.5 text-xs">
                  {capturedLead.name && <div>Name: <span className="text-[var(--text)]">{capturedLead.name}</span></div>}
                  {capturedLead.phone && <div className="flex items-center gap-1"><Phone size={10} />{capturedLead.phone}</div>}
                  {capturedLead.email && <div className="flex items-center gap-1"><Mail size={10} />{capturedLead.email}</div>}
                  <div>Score: <span className={`font-medium ${tempConfig.color}`}>{capturedLead.score}/150</span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-3 border-t border-[var(--border)] bg-[var(--background)]">
            {!isComplete ? (
              <div className="flex items-center gap-2">
                <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}} placeholder="Type your message..." disabled={isLoading} className="flex-1 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)] disabled:opacity-50" />
                <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} className="w-9 h-9 bg-[var(--accent)] text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40">
                  <Send size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => { setMessages([]); setLeadState({ step: 0, score: 0 }); setIsComplete(false); setCapturedLead(null); setTemperature("ice"); initChat(); }} className="w-full text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 py-2 hover:border-[var(--accent)] transition-colors text-[var(--text-muted)]">
                Start new conversation
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default LeadQualificationChat;