# REAPA Landing Page

Waitlist landing page for REAPA — AI personal assistant for real estate agents.

## Setup

1. `npm install`
2. Copy `.env.local.example` → `.env.local`
3. Create a Notion internal integration at https://www.notion.so/profile/integrations
4. Share the **REAPA Waitlist** database with your integration
5. Add the integration token as `NOTION_API_KEY` in Vercel env vars
6. `npm run dev`

## Waitlist Database
- Notion DB: https://www.notion.so/34451e3c53a481d0a922ec45ab0cf6c4
- DB ID: `34451e3c-53a4-81d0-a922-ec45ab0cf6c4`

## Deploy
Deployed automatically to Vercel on push to `main`.
