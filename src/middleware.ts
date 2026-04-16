import { NextRequest, NextResponse } from "next/server";

/**
 * REAPA Middleware
 *
 * Current: Basic security headers pass-through.
 * Next step: Uncomment Supabase session check once NEXT_PUBLIC_SUPABASE_URL is set.
 *
 * To enable Supabase auth:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env vars
 *   2. Uncomment the supabase block below
 *   3. Unauthenticated users will be redirected to /login
 */

// PROTECTED_ROUTES — require auth once Supabase is connected
const PROTECTED = ["/", "/leads", "/clients", "/tasks", "/analytics"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Supabase session check (enable after Supabase is configured) ──────────
  // import { createServerClient } from "@supabase/ssr";
  // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  //
  // if (supabaseUrl && supabaseAnonKey) {
  //   const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
  //     cookies: {
  //       getAll: () => request.cookies.getAll(),
  //       setAll: (c) => { const res = NextResponse.next({ request }); c.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); return res; },
  //     },
  //   });
  //   const { data: { session } } = await supabase.auth.getSession();
  //   const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  //   if (!session && isProtected) return NextResponse.redirect(new URL("/login", request.url));
  //   if (session && AUTH_ROUTES.includes(pathname)) return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
