import type { NextConfig } from "next";

const ALLOWED_ORIGINS = [
  "https://reapa-mvp.vercel.app",
  "https://reapa.ai",
];

const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const allowedOrigins = process.env.NODE_ENV === "development"
  ? [...ALLOWED_ORIGINS, ...DEV_ORIGINS]
  : ALLOWED_ORIGINS;

// BUG-008: unsafe-eval is ONLY needed for Next.js HMR in development
const scriptSrc = process.env.NODE_ENV === "development"
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const nextConfig: NextConfig = {
  // BUG-037: expose server-side env vars via next.config — insurance for edge route static inlining
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // BUG-001: Explicit CORS — no wildcard
          {
            key: "Access-Control-Allow-Origin",
            value: allowedOrigins.join(","),
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          // BUG-002: Security headers
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src \'self\'",
              scriptSrc,  // BUG-008: no unsafe-eval in prod
              "style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com",
              "font-src \'self\' https://fonts.gstatic.com",
              "img-src \'self\' data: blob: https:",
              "connect-src \'self\' https://*.supabase.co https://api.notion.com https://api.openai.com https://generativelanguage.googleapis.com https://eu.posthog.com",
              "frame-ancestors \'none\'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
