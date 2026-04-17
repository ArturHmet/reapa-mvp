import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * REAPA Middleware — Supabase session auth guard
 * Protects dashboard routes; redirects unauthenticated users to /login.
 */

const PROTECTED = ["/", "/leads", "/clients", "/tasks", "/analytics", "/admin", "/onboarding"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured (local dev without env), pass through
  if (!supabaseUrl || supabaseUrl.includes("placeholder") || !supabaseAnonKey || supabaseAnonKey.includes("placeholder")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Unauthenticated → redirect to login
  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ADMIN-RBAC-001: role gate — non-admin authenticated users → /403
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  if (session && isAdminPath) {
    const meta        = session.user.user_metadata ?? {};
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    const isAdmin     = meta.role === "admin" || adminEmails.includes((session.user.email ?? "").toLowerCase());
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  // Already authenticated → skip auth pages
  if (session && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|waitlist|blog|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
