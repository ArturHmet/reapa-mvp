# REAPA API Routes

All routes are under `/src/app/api/` (Next.js 16 App Router).

## Public Routes

### `GET /api/health`
Health check. Returns `{ok: true}`.

### `GET /api/warmup`
Keep-alive ping (COLD-001). Fires HEAD to `/api/ai/chat` to keep runtime warm.  
Also called every 5 min by GitHub Actions workflow (ID 262163746).

### `POST /api/ai/chat`
Main AI chat endpoint (Server-Sent Events / streaming).  
Runs NLP pipeline (Stages 1–5), builds Gemini system prompt with lead context, streams response.  
Model: Gemini 2.5 Flash. Rate limited (Supabase `increment_rate_limit` RPC).

### `GET /api/waitlist` · `POST /api/waitlist`
Waitlist email capture. Writes to Supabase `waitlist` table.  
Returns count of waitlist entries on GET.

---

## Protected Routes (Supabase session required in production)

### `GET /api/dashboard`
Aggregated dashboard stats: totalLeads, hotLeads, activeClients, pendingTasks,
overdueTasks, conversionRate, avgResponseTime, revenue, viewingsToday,
funnelData[], leadSourceData[].

### `GET /api/leads`
Returns all leads ordered by `created_at DESC`.  
Maps DB temperature → hot/warm/cold; parses budget_range → number.

### `POST /api/leads/{id}/convert`  *(Sprint 7)*
Converts a lead to a client.
1. Fetches lead by `id` (404 if not found; 409 if `temperature === "ice"`)
2. Parses `budget_range` → `budget_min`/`budget_max`
3. Creates client record in `clients` table
4. Marks lead `temperature = "ice"` (closed/converted)

Returns: `{success: true, clientId: string}` (201) or 404/409/500.

### `GET /api/clients`
Returns all active clients.

### `GET /api/tasks` · `POST /api/tasks`
GET: Returns all tasks ordered by priority.  
POST: Creates a task. Required: `title`. Optional: `priority`, `category`, `due_date`.  
Returns 201 + created task on success.

---

## Admin Routes (auth-gated, REAPA_API_KEY or session)

### `GET /admin`
Admin panel UI. Sortable/filterable tables: Leads, Clients, Tasks. CSV export on Leads.

---

## Internal / NLP

### `POST /api/chat/qualify`
NLP qualification endpoint. Runs `runNLPPipeline()` on incoming message.  
Returns structured lead data: intent, entities, temperature, confidence scores.
