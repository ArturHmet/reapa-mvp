import { NextRequest, NextResponse } from "next/server";

const NOTION_DB_ID = "34451e3c-53a4-81d0-a922-ec45ab0cf6c4";

export async function POST(req: NextRequest) {
  try {
    const { email, name, role } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const notionKey = process.env.NOTION_API_KEY;

    if (notionKey) {
      // Save to Notion database
      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${notionKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          parent: { database_id: NOTION_DB_ID },
          properties: {
            Email: { title: [{ text: { content: email } }] },
            Name: { rich_text: [{ text: { content: name || "" } }] },
            Role: { rich_text: [{ text: { content: role || "Real estate agent" } }] },
            Source: { rich_text: [{ text: { content: "Landing page waitlist" } }] },
            "Signed Up At": { date: { start: new Date().toISOString() } },
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[Waitlist] Notion error:", err);
        // Don't fail — still show success to user
      } else {
        console.log(`[Waitlist] ✅ Saved ${email} to Notion`);
      }
    } else {
      // Notion key not configured — log and continue
      console.log(`[Waitlist] New signup (Notion not configured): ${email} / ${name} / ${role}`);
    }

    return NextResponse.json({ success: true, message: "You\'re on the list!" });
  } catch (err) {
    console.error("[Waitlist] Error:", err);
    return NextResponse.json({ success: true }); // Always show success to user
  }
}
