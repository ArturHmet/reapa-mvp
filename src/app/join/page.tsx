"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * /join?ref=CODE
 *
 * Capture a referral code from the URL, persist it to localStorage so it
 * is attached to the waitlist signup, then bounce the visitor to the
 * homepage to complete their signup.
 *
 * Works without JS (meta refresh fallback) and without auth.
 */
export default function JoinPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Capture ref param
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref")?.trim().toUpperCase();
    if (ref && /^[A-Z0-9]{4,10}$/.test(ref)) {
      try { localStorage.setItem("reapa_ref_code", ref); } catch { /* private browsing */ }
    }

    // Countdown then redirect
    let t = 3;
    const interval = setInterval(() => {
      t -= 1;
      setCountdown(t);
      if (t <= 0) {
        clearInterval(interval);
        router.replace("/?ref=" + (ref ?? ""));
      }
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0d0d28] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <span className="text-white font-bold text-3xl">R</span>
          </div>
        </div>

        {/* Copy */}
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            You&apos;ve been invited to REAPA 🎉
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your friend thinks you&apos;d love the AI Copilot for real estate agents.
            Qualify leads in 10 languages, 24/7.
          </p>
        </div>

        {/* Spinner + redirect notice */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">
            Taking you to REAPA in {countdown}…
          </p>
        </div>

        {/* Manual CTA fallback */}
        <a
          href="/"
          className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Go to REAPA now →
        </a>
      </div>
    </div>
  );
}
