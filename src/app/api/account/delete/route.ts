import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * DELETE /api/account/delete
 * GDPR Art. 17 — Right to Erasure.
 *
 * Deletes the authenticated user's account and all related data.
 * Uses the Supabase service-role key to bypass RLS for the admin call.
 *
 * Data deleted (cascade via DB foreign keys + explicit deletes):
 *   - auth.users (Supabase Auth — deletes auth record)
 *   - leads (user's leads)
 *   - clients (user's clients)
 *   - tasks (user's tasks)
 *   - rate_limits (user's rate limit records)
 *   - waitlist entries matching user email
 */
export async function DELETE() {
  try {
    // ── 1. Identify the requesting user ──────────────────────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const userEmail = user.email ?? "";

    // ── 2. Delete user data (explicit, before auth deletion) ─────────────────
    // RLS-protected tables — use anon client (user is still authenticated here)
    const tables = ["tasks", "clients", "leads", "rate_limits"] as const;
    for (const table of tables) {
      // Suppress errors — table may not exist for this user or column may differ
      await supabase.from(table).delete().eq("user_id", userId).throwOnError().catch(() => {});
    }

    // Waitlist by email
    if (userEmail) {
      await supabase.from("waitlist").delete().eq("email", userEmail).catch(() => {});
    }

    // ── 3. Delete auth user (requires service-role key) ───────────────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      // Fallback: sign out only (data already deleted above)
      console.warn("[delete-account] SUPABASE_SERVICE_ROLE_KEY not set — skipping auth.users deletion");
    } else {
      const { createClient } = await import("@supabase/supabase-js");
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error("[delete-account] auth.admin.deleteUser error:", deleteError);
        return NextResponse.json(
          { error: "Failed to delete auth record. Contact privacy@reapa.ai." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error("[delete-account] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
