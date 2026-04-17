# REAPA NLP Pipeline

> **Version**: 1.0 · **Updated**: 2026-04-17 · **Runtime**: Node.js (Next.js API route)

---

## Overview

The REAPA NLP Pipeline is a 5-stage text analysis system that processes every user message before it reaches the AI copilot. It extracts structured signals (language, intent, entities, confidence) and injects them into the Gemini system prompt so the AI always has rich context about each visitor.

```
User message
     │
     ▼
┌─ Stage 1 ──────────────────┐
│  Language Detection         │  franc-min → en / ru / es / other
└─────────────────────────────┘
     │
     ▼
┌─ Stage 2 ──────────────────┐
│  Intent Classification      │  regex fast-path + Gemini fallback
└─────────────────────────────┘  buy / sell / rent / info / other
     │
     ▼
┌─ Stage 3 ──────────────────┐
│  Entity Extraction          │  budget, location, property type,
└─────────────────────────────┘  timeline, bedrooms
     │
     ▼
┌─ Stage 4 ──────────────────┐
│  Confidence Scoring         │  per-entity 0-100, overall, lead temp
└─────────────────────────────┘  hot / warm / cold / ice
     │
     ▼
┌─ Stage 5 ──────────────────┐
│  Context Assembly           │  JSON snippet injected into Gemini
└─────────────────────────────┘  system prompt → enriched response
     │
     ▼
Gemini 2.5 Flash (personalised response)
```

---

## Stage 1 — Language Detection

**File**: `src/lib/ai/nlp-pipeline.ts → detectLanguage()`  
**Library**: [`franc-min`](https://github.com/wooorm/franc) (lightweight ISO 639-3 identifier)

Detects the language from the raw message text and maps it to a normalised code used downstream for localised responses.

| franc code | REAPA code | Description |
|-----------|------------|-------------|
| `eng` | `en` | English |
| `rus` | `ru` | Russian |
| `spa` | `es` | Spanish |
| *other* | `other` | Unsupported — passes through, Gemini handles gracefully |

**Fallback**: On franc import failure (e.g., edge environments), defaults to `"en"`.

```ts
const language = await detectLanguage("Хочу купить квартиру в Слиме");
// → "ru"
```

---

## Stage 2 — Intent Classification

**File**: `src/lib/ai/nlp-pipeline.ts → classifyIntent()`  
**Strategy**: Regex pattern bank (fast-path) with confidence scoring

Five intent classes are supported. Each has a set of multilingual regex patterns (English, Russian, Spanish). The classifier accumulates a score per intent (+25 per matching pattern, capped at 100) and returns the highest-scoring class.

| Intent | Example triggers | Score per match |
|--------|-----------------|-----------------|
| `buy` | "looking to buy", "купить", "comprar" | +25 |
| `sell` | "want to sell", "продать", "vender" | +25 |
| `rent` | "rent", "аренда", "alquiler" | +25 |
| `info` | "how much", "сколько стоит", "precio" | +25 |
| `other` | (no pattern matched) | 30 (default) |

**Cyrillic note**: JavaScript's `\b` word boundary does not match non-ASCII characters. All Cyrillic patterns use bare regex without `\b` (BUG-T003 fix).

```ts
const { intent, confidence } = classifyIntent("I want to buy a penthouse in Sliema");
// → { intent: "buy", confidence: 50 }
```

---

## Stage 3 — Entity Extraction

**File**: `src/lib/ai/nlp-pipeline.ts → extractBudget / extractLocation / extractPropertyType / extractTimeline / extractBedrooms`

Five entity extractors run in parallel on the message text.

### 3.1 Budget (`extractBudget`)

Recognises three patterns with decreasing confidence:

| Pattern | Example | Confidence |
|---------|---------|-----------|
| Range `A–B` | "€300K–€500K", "300-500k" | 90 |
| Bounded `under/over/до/от` | "under €400K", "до 200 тысяч" | 80 |
| Single currency symbol | "$750,000" | 70 |

Suffix normalisation: `K/k/тыс` → ×1,000 · `M/m/млн` → ×1,000,000.

### 3.2 Location (`extractLocation`)

Maintains a curated list of **30 Malta localities** (Sliema, St Julian's, Valletta, Gozo, etc.) + international hubs. Malta locations score confidence 95; international 75. Falls back to a fuzzy regex (`near/in/около`) at confidence 55.

### 3.3 Property Type (`extractPropertyType`)

Matches: apartment / flat / studio / penthouse / villa / house / townhouse / maisonette / farmhouse / office / commercial / garage / land.

### 3.4 Timeline (`extractTimeline`)

Recognises urgency signals: "asap", "next month", "3-6 months", "не спешу", "sin prisa", etc.

### 3.5 Bedrooms (`extractBedrooms`)

Parses "2 bedroom", "3-bed", "однокомнатная", "2 habitaciones" → integer.

---

## Stage 4 — Confidence Scoring

**File**: `src/lib/ai/nlp-pipeline.ts → runNLPPipeline()`

Combines per-entity scores into an `overallConfidence` and maps to a `leadTemperature`:

| Temperature | Condition |
|-------------|-----------|
| `hot` | intentConfidence ≥ 70 AND overallConfidence ≥ 60 |
| `warm` | intentConfidence ≥ 50 OR overallConfidence ≥ 40 |
| `cold` | intentConfidence ≥ 25 |
| `ice` | below all thresholds |

`entityCount` = number of entities with extracted values (used for lead scoring in `/api/chat/qualify`).

---

## Stage 5 — Context Assembly & AI Enrichment

**File**: `src/app/api/ai/chat/route.ts → buildNLPContext()`

The NLP result is serialised into a compact JSON context string and appended to the Gemini system prompt **before every request**:

```
User context: {"language":"ru","intent":"buy","confidence":75,"temperature":"hot","budget":"€300K–€500K","location":"Sliema","bedrooms":2}
```

This gives Gemini per-message awareness of:
- The user's language (so it responds in kind)
- Detected intent (buy/sell/rent/info)
- Confidence of that detection
- Lead temperature (hot → prioritise conversion language)
- Any extracted entities (budget, location, bedrooms, property type, timeline)

If the NLP pipeline throws (e.g., franc import fails on cold start), the catch is **non-fatal** — the system prompt is used without enrichment. This ensures 100% uptime for the chat widget.

---

## Integration Points

| Route | How it uses the pipeline |
|-------|--------------------------|
| `POST /api/ai/chat` | Runs full pipeline, injects `buildNLPContext()` into Gemini system prompt |
| `POST /api/chat/qualify` | Calls `runNLPPipeline()` at each step for `nlp` metadata stored in lead state; NLP language used for localised step responses |

---

## Test Coverage

| File | Statements | Branches | Notes |
|------|-----------|----------|-------|
| `src/lib/ai/nlp-pipeline.ts` | 92.9% | 80.7% | 25/25 tests passing |
| `src/app/api/ai/chat/route.ts` | — | — | Phase 3 test suite |
| `src/app/api/chat/qualify/route.ts` | 75.81% | 62.75% | 11/11 tests passing |

---

## Performance

- Cold start (first request): franc-min dynamic import adds ~10ms
- Warm path (regex only): < 1ms
- Full pipeline (all 5 extractors): < 5ms typical

The pipeline is intentionally synchronous/local — no external API calls, no DB queries. All enrichment happens before the Gemini call.

---

## Extending the Pipeline

### Add a new language

1. Add the franc ISO code to `LANG_MAP` in `nlp-pipeline.ts`
2. Add patterns to `INTENT_PATTERNS` for the new language (no `\b` around Cyrillic/CJK)
3. Add test cases to `src/__tests__/unit/nlp-pipeline.test.ts`

### Add a new entity extractor

1. Create `extractXxx(text: string): EntityValue<T> | undefined`
2. Add the field to `ExtractedEntities` interface
3. Call it inside `runNLPPipeline()` and include in `entityCount`

### Add a new intent

1. Add the intent to the `Intent` type
2. Add patterns to `INTENT_PATTERNS`
3. Add a scoring entry in `/api/chat/qualify/route.ts → SCORING.intent`
