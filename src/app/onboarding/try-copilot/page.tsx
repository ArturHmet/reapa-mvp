"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { captureEvent } from "@/lib/posthog";
import { useToast } from "@/components/Toast";
import { Send } from "lucide-react";

interface ChatMsg  { role: "assistant" | "user"; content: string; }
interface ConvState { step: number; score: number; [k: string]: unknown; }

export default function OnboardingTryCopilot() {
  const { t }        = useTranslation();
  const router       = useRouter();
  const { addToast } = useToast();
  const bottomRef    = useRef<HTMLDivElement>(null);

  const [messages,  setMessages]  = useState<ChatMsg[]>([
    { role: "assistant", content: t("onboarding.s3CopilotIntro") },
  ]);
  const [convState, setConvState] = useState<ConvState>({ step: 0, score: 0 });
  const [input,     setInput]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [responded, setResponded] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  // Sprint 11 — track whether step 3 completed event has fired
  const [step3Done, setStep3Done] = useState(false);

  // Sprint 11 — funnel step 3 viewed
  useEffect(() => {
    captureEvent("onboarding_step_viewed", { step: 3 });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function completOnboarding() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.updateUser({ data: { onboarding_complete: true } }).catch(() => {});
    // Sprint 11 — funnel step 4 = completion
    captureEvent("onboarding_step_completed", { step: 4, lead_saved: leadSaved });
    captureEvent("onboarding_completed", { lead_saved: leadSaved });
    router.replace("/");
  }

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setSending(true);
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);

    // Sprint 11 — funnel step 3 completed on first user message sent
    if (!step3Done) {
      captureEvent("onboarding_step_completed", { step: 3 });
      setStep3Done(true);
    }

    try {
      const res = await fetch("/api/chat/qualify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: msg, state: convState }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      if (data.state)      setConvState(data.state);
      if (data.isComplete) {
        setLeadSaved(true);
        addToast(t("onboarding.s3LeadSaved"), "success");
        captureEvent("onboarding_lead_qualified", { source: "onboarding" });
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong — please try again." }]);
    } finally {
      setSending(false);
      setResponded(true);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* Back + progress */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/onboarding/language")}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            {t("onboarding.backBtn")}
          </button>
          <div className="flex-1 flex justify-center">
            <ProgressDots current={2} />
          </div>
          <div className="w-10" />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold mb-1">{t("onboarding.s3Headline")}</h1>
          <p className="text-[var(--text-muted)] text-sm">{t("onboarding.s3Subhead")}</p>
        </div>

        {/* Mini chat */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: "220px", maxHeight: "320px" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-[var(--bg)] text-[var(--text)]"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg)] rounded-xl px-3 py-2 flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-[var(--border)]">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={t("onboarding.s3DemoPrompt")}
              disabled={sending}
              className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || sending}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors flex-shrink-0">
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Pre-filled demo chip */}
        {messages.length < 3 && (
          <button
            onClick={() => handleSend(t("onboarding.s3DemoPrompt"))}
            disabled={sending}
            className="text-left w-full px-3 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
          >
            💬 {t("onboarding.s3DemoPrompt")}
          </button>
        )}

        {/* Finish button */}
        <button
          onClick={completOnboarding}
          className={`w-full py-3 font-semibold rounded-xl transition-all text-sm ${
            leadSaved
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          {leadSaved ? t("onboarding.s3OpenDashboard") : t("onboarding.s3GoToDashboard")}
        </button>

        {!responded && (
          <p className="text-center text-[10px] text-[var(--text-muted)]">{t("onboarding.s3SendHint")}</p>
        )}
      </div>
    </div>
  );
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map(i => (
        <div key={i} className={`rounded-full transition-all ${i === current ? "w-6 h-2 bg-indigo-500" : "w-2 h-2 bg-[var(--border)]"}`} />
      ))}
    </div>
  );
}
