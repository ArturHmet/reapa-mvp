import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// BUG-037: edge runtime can't use Supabase admin client (requires Node crypto).
// Changed to nodejs so createAdminClient() resolves correctly.
export const runtime = "nodejs";

/**
 * GET /api/waitlist/count
 *
 * Returns the current waitlist signup count.
 * Used by Marketing + Analytics agents to track waitlist growth.
 *
 * Data source priority:
 *   1. Supabase (primary) — query waitlist table via admin client
 *   2. Notion (fallback)  — NOTION_API_KEY + NOTION_WAITLIST_DB_ID
 *   3. Placeholder        — returns 0 when nothing is configured
 */
export async function GET() {
  // ── 1. Supabase (primary) ────────────────────────────────────────────────
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (!error) {
      return NextResponse.json({
        count: count ?? 0,
        source: "supabase",
        timestamp: new Date().toISOString(),
      });
    }
  } catch {
    // fall through to Notion
  }

  // ── 2. Notion (fallback) ─────────────────────────────────────────────────
  const notionKey = process.env.NOTION_API_KEY;
  const notionDb  = process.env.NOTION_WAITLIST_DB_ID;

  if (notionKey && notionDb) {
    try {
      const res = await fetch(`https://api.notion.com/v1/databases/${notionDb}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${notionKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 100 }),
      });

      if (res.ok) {
        const data = await res.json() as { results?: unknown[] };
        return NextResponse.json({
          count: data.results?.length ?? 0,
          source: "notion",
          note: "Notion pagination limit 100; full count requires cursor pagination",
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      // fall through to placeholder
    }
  }

  // ── 3. Placeholder ───────────────────────────────────────────────────────
  return NextResponse.json({
    count: 0,
    source: "placeholder",
    note: "Connect Supabase or set NOTION_API_KEY + NOTION_WAITLIST_DB_ID to get real count",
    timestamp: new Date().toISOString(),
  });
}
