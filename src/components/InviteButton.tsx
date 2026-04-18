"use client";
import { useState, useCallback } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface InviteButtonProps {
  /** Authenticated user email — used to generate/retrieve their referral code. */
  email: string;
  /** Optional extra className for the trigger button. */
  className?: string;
}

/**
 * InviteButton — copy-to-clipboard referral link.
 *
 * On first click fetches/generates a code from /api/referral/generate then
 * copies the invite URL to clipboard. Subsequent clicks copy instantly.
 */
export function InviteButton({ email, className = "" }: InviteButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">("idle");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    // If we already have the URL, copy directly
    if (inviteUrl) {
      await copyToClipboard(inviteUrl);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/referral/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to generate code");
      const data = await res.json() as { invite_url: string };
      setInviteUrl(data.invite_url);
      await copyToClipboard(data.invite_url);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }, [email, inviteUrl]);

  const label =
    state === "loading" ? "Generating…" :
    state === "copied"  ? "Link copied!" :
    state === "error"   ? "Try again"   :
    "Invite agents";

  const Icon =
    state === "copied" ? Check :
    state === "loading" ? Share2 :
    state === "error"   ? Copy : Share2;

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className={[
        "flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all",
        state === "copied"
          ? "bg-green-600/20 text-green-400 border border-green-600/30"
          : state === "error"
          ? "bg-red-600/20 text-red-400 border border-red-600/30"
          : "bg-indigo-600/20 text-indigo-300 border border-indigo-600/30 hover:bg-indigo-600/30",
        className,
      ].join(" ")}
      title="Share your referral link and earn priority access"
    >
      <Icon size={14} className={state === "loading" ? "animate-pulse" : ""} />
      {label}
    </button>
  );
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers / iOS Safari in iframes
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}
