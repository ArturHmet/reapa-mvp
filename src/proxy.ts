import { NextRequest, NextResponse } from "next/server";

/**
 * REAPA Proxy (Next.js 16 — was middleware.ts)
 * Supabase session check ready — uncomment after NEXT_PUBLIC_SUPABASE_URL is set on Vercel.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Supabase session check (enable after Supabase credentials are set) ────
  // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // if (supabaseUrl && supabaseAnonKey) {
  //   const { createClient } = await import("@/lib/supabase/server");
  //   const supabase = await createClient();
  //   const { data: { session } } = await supabase.auth.getSession();
  //   const PROTECTED = ["/", "/leads", "/clients", "/tasks", "/analytics"];
  //   const AUTH_ROUTES = ["/login", "/signup"];
  //   const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  //   if (!session && isProtected) return NextResponse.redirect(new URL("/login", request.url));
  //   if (session && AUTH_ROUTES.includes(pathname)) return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
