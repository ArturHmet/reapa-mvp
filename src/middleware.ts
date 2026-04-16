import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth middleware — enforces Supabase Auth once configured
// TODO: Replace with Supabase SSR session check after Supabase project is connected
export function middleware(request: NextRequest) {
  // Allow all requests during development
  // After Supabase setup: check session and redirect unauthenticated users to /login
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
