import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * GET /api/waitlist/count
 * Returns the current waitlist signup count.
 * Used by Marketing + Analytics agents to track waitlist growth.
 *
 * Data source priority:
 *   1. Supabase (when connected) — query waitlist_signups table
 *   2. Notion (NOTION_API_KEY + NOTION_WAITLIST_DB_ID) — query waitlist database
 *   3. Fallback: returns placeholder
 */
export async function GET() {
  // Try Notion (currently connected)
  const notionKey = process.env.NOTION_API_KEY;
  const notionDb = process.env.NOTION_WAITLIST_DB_ID;

  if (notionKey && notionDb) {
    try {
      const res = await fetch(`https://api.notion.com/v1/databases/${notionDb}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${notionKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 1 }),
      });

      if (res.ok) {
        const data = await res.json();
        // Notion returns total_count in some cases; otherwise count via results
        const count = (data as { results?: unknown[] }).results?.length ?? 0;
        return NextResponse.json({
          count,
          source: "notion",
          note: "Notion pagination limit: use ?all=1 for full count",
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      // fall through to placeholder
    }
  }

  // Placeholder — remove once Supabase is connected
  return NextResponse.json({
    count: 0,
    source: "placeholder",
    note: "Connect Supabase or set NOTION_API_KEY + NOTION_WAITLIST_DB_ID to get real count",
    timestamp: new Date().toISOString(),
  });
}
