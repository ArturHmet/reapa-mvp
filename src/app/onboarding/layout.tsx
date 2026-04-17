"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * OnboardingLayout — fixed full-screen overlay, no sidebar.
 * Guards: if onboarding_complete = true redirect to dashboard (handles
 * back-navigation after completion).
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.onboarding_complete === true) {
        router.replace("/");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-base)] overflow-y-auto flex flex-col">
      {children}
    </div>
  );
}
