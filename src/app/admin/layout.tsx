import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * UX-BETA-003: Admin role guard.
 * Allows access only to users with user_metadata.role === 'admin'
 * OR whose email is in the ADMIN_EMAILS allowlist env var.
 * Beta agents must never see the admin panel (privacy + trust).
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setAll: (_: Array<{ name: string; value: string; options: CookieOptions }>) => {},
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Pass-through in dev / CI environments with no Supabase configured
  if (!supabaseUrl || supabaseUrl.includes("placeholder") || !supabaseAnon) {
    return <>{children}</>;
  }

  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const isAdmin =
    user.user_metadata?.role === "admin" ||
    ADMIN_EMAILS.includes((user.email ?? "").toLowerCase());

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-xl font-bold mb-2">Access Restricted</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm">
          This area is for the REAPA team only. If you believe this is an error,
          contact <a href="mailto:hello@reapa.ai" className="text-indigo-400 hover:underline">hello@reapa.ai</a>.
        </p>
        <a href="/" className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-xl hover:bg-[var(--accent-hover)] transition-colors">
          Back to Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
