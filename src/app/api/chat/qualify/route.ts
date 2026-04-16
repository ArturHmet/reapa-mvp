import { NextRequest, NextResponse } from "next/server";
import { runNLPPipeline } from "@/lib/ai/nlp-pipeline";

export const runtime = "edge";

const SCORING = {
  intent: { buy: 30, sell: 30, valuation: 30, rent: 20, browse: 5 },
  timeline: { "1month": 40, "1-3months": 25, "3-6months": 15, "6plus": 5 },
  budget: { "1M+": 20, "700K-1M": 15, "400K-700K": 10, "200K-400K": 8, "under200K": 5 },
  financing: { "pre-approved": 25, cash: 25, "in-progress": 10, "not-started": 5 },
  locationSpecific: 10,
  contactProvided: 15,
};

interface ChatMessage { role: "assistant" | "user"; content: string; }

interface LeadState {
  step: number; score: number;
  intent?: string; timeline?: string; budget?: string;
  location?: string; financing?: string;
  name?: string; phone?: string; email?: string;
  nlp?: {
    language: string; intentConfidence: number;
    entityCount: number; leadTemperature: string; overallConfidence: number;
  };
}

function getTemperature(score: number): "hot" | "warm" | "cold" | "ice" {
  if (score >= 100) return "hot";
  if (score >= 60) return "warm";
  if (score >= 20) return "cold";
  return "ice";
}

function getNextQuestion(
  state: LeadState, userMessage: string, language = "en"
): { message: string; newState: LeadState; isComplete: boolean } {
  const msg = userMessage.toLowerCase();
  let s = { ...state };
  const pfx: Record<string, string> = { ru: "Отлично! ", es: "¡Perfecto! ", en: "", other: "" };
  const p = pfx[language] ?? "";

  switch (state.step) {
    case 0: {
      let intent = "browse", score = SCORING.intent.browse;
      if (msg.includes("buy")||msg.includes("purchase")||msg.includes("looking for")||msg.includes("купить")||msg.includes("comprar")) { intent="buy"; score=SCORING.intent.buy; }
      else if (msg.includes("sell")||msg.includes("продать")||msg.includes("vender")) { intent="sell"; score=SCORING.intent.sell; }
      else if (msg.includes("valuation")||msg.includes("value")) { intent="valuation"; score=SCORING.intent.valuation; }
      else if (msg.includes("rent")||msg.includes("lease")||msg.includes("аренд")||msg.includes("alquil")) { intent="rent"; score=SCORING.intent.rent; }
      s = { ...s, intent, score: s.score + score, step: 1 };
      const r: Record<string, string> = {
        buy: "Great choice! Malta has some fantastic properties right now. When are you looking to buy?",
        sell: "Perfect timing to sell. When are you looking to complete the sale?",
        valuation: "Happy to help with a valuation. When do you need it done?",
        rent: "I can help you find the right rental. When do you need to move in?",
        browse: "No problem, happy to show you what\u2019s available. Any rough timeline in mind?",
      };
      return { message: p + r[intent], newState: s, isComplete: false };
    }
    case 1: {
      let timeline = "6plus", score = SCORING.timeline["6plus"];
      if (msg.includes("asap")||msg.includes("urgent")||msg.includes("month")||msg.includes("now")||msg.includes("\u0441\u0435\u0439\u0447\u0430\u0441")) { timeline="1month"; score=SCORING.timeline["1month"]; }
      else if (msg.includes("1-3")||msg.includes("few months")||msg.includes("next month")) { timeline="1-3months"; score=SCORING.timeline["1-3months"]; }
      else if (msg.includes("3-6")||msg.includes("six months")) { timeline="3-6months"; score=SCORING.timeline["3-6months"]; }
      s = { ...s, timeline, score: s.score + score, step: 2 };
      const bQ = s.intent==="sell" ? "What are you expecting to get for the property?" : "What\u2019s your budget range?";
      return { message: `Got it! ${bQ}\n\nA) Under \u20ac200K\nB) \u20ac200K \u2013 \u20ac400K\nC) \u20ac400K \u2013 \u20ac700K\nD) \u20ac700K \u2013 \u20ac1M\nE) Over \u20ac1M`, newState: s, isComplete: false };
    }
    case 2: {
      let budget = "under200K", score = SCORING.budget["under200K"];
      if (msg.includes("1m")||msg.includes("million")||msg.includes("over")||msg.includes("e)")) { budget="1M+"; score=SCORING.budget["1M+"]; }
      else if (msg.includes("700")||msg.includes("d)")) { budget="700K-1M"; score=SCORING.budget["700K-1M"]; }
      else if (msg.includes("400")||msg.includes("500")||msg.includes("600")||msg.includes("c)")) { budget="400K-700K"; score=SCORING.budget["400K-700K"]; }
      else if (msg.includes("200")||msg.includes("300")||msg.includes("b)")) { budget="200K-400K"; score=SCORING.budget["200K-400K"]; }
      s = { ...s, budget, score: s.score + score, step: 3 };
      return { message: "Which area in Malta are you interested in? (e.g., Sliema, St. Julian\u2019s, Valletta, Mellieha, Gozo, or anywhere)", newState: s, isComplete: false };
    }
    case 3: {
      const locs = ["sliema","julian","valletta","msida","birkirkara","mellieha","gozo","mosta","naxxar","bugibba","marsaskala","rabat"];
      const hasLoc = locs.some(l => msg.includes(l)) || msg.length > 3;
      s = { ...s, location: userMessage, score: s.score + (hasLoc ? SCORING.locationSpecific : 0), step: 4 };
      if (s.intent==="buy"||s.intent==="browse") return { message: "Do you have financing arranged?\n\nA) Yes, pre-approved mortgage\nB) Cash buyer\nC) Working on it\nD) Not started yet", newState: s, isComplete: false };
      s.step = 5;
      return { message: "Perfect! To connect you with our specialist, could I get your name and phone number?", newState: s, isComplete: false };
    }
    case 4: {
      let financing = "not-started", score = SCORING.financing["not-started"];
      if (msg.includes("pre")||msg.includes("approved")||msg.includes("a)")) { financing="pre-approved"; score=SCORING.financing["pre-approved"]; }
      else if (msg.includes("cash")||msg.includes("b)")) { financing="cash"; score=SCORING.financing.cash; }
      else if (msg.includes("working")||msg.includes("c)")) { financing="in-progress"; score=SCORING.financing["in-progress"]; }
      s = { ...s, financing, score: s.score + score, step: 5 };
      return { message: "Great! To connect you with our specialist, could I get your name and phone number?", newState: s, isComplete: false };
    }
    case 5: {
      const phoneMatch = msg.match(/(\+356\s?)?(\d[\d\s]{6,11})/);
      const emailMatch = msg.match(/[\w.-]+@[\w.-]+\.\w+/);
      s = { ...s, name: userMessage.split(",")[0].trim(), phone: phoneMatch?.[0], email: emailMatch?.[0], score: s.score + (phoneMatch||emailMatch ? SCORING.contactProvided : 0), step: 6 };
      const temp = getTemperature(s.score);
      const times: Record<string, string> = { hot: "within 15 minutes", warm: "within 2 hours", cold: "within 24 hours", ice: "soon" };
      const name = s.name?.split(" ")[0] || "there";
      return { message: `Thank you, ${name}! Our specialist will be in touch ${times[temp]}.\n\nI\u2019ve found properties matching your criteria. Our agent will have a full briefing ready for your call.`, newState: s, isComplete: true };
    }
    default:
      return { message: "Is there anything else I can help you with?", newState: s, isComplete: true };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, state }: { messages: ChatMessage[]; state: LeadState } = body;
    const currentState: LeadState = state || { step: 0, score: 0 };
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // ── NLP Pipeline (Stages 1-4) ──────────────────────────────────────────
    const nlp = await runNLPPipeline(lastUserMessage);

    const enriched: LeadState = {
      ...currentState,
      nlp: { language: nlp.language, intentConfidence: nlp.intentConfidence, entityCount: nlp.entityCount, leadTemperature: nlp.leadTemperature, overallConfidence: nlp.overallConfidence },
      location: currentState.location ?? nlp.entities.location?.value,
      intent: currentState.intent ?? (nlp.intent !== "other" ? nlp.intent : undefined),
    };

    const { message, newState, isComplete } = getNextQuestion(enriched, lastUserMessage, nlp.language);
    const temperature = getTemperature(newState.score);

    return NextResponse.json({
      message, state: newState, isComplete, score: newState.score, temperature,
      nlp: { language: nlp.language, intent: nlp.intent, intentConfidence: nlp.intentConfidence, entities: nlp.entities, leadTemperature: nlp.leadTemperature, overallConfidence: nlp.overallConfidence },
      lead: isComplete ? { name: newState.name, phone: newState.phone, email: newState.email, score: newState.score, temperature, intent: newState.intent, budget: newState.budget, location: newState.location, language: nlp.language } : null,
    });
  } catch (error) {
    console.error("Lead qualification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Hi! I\u2019m REAPA, your real estate assistant. How can I help you today?\n\nAre you looking to:\nA) Buy a property\nB) Sell a property\nC) Rent a property\nD) Get a property valuation\nE) Just browsing",
    state: { step: 0, score: 0 }, isComplete: false,
  });
}
