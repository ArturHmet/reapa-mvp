import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth middleware — will enforce Supabase Auth once configured
export function middleware(request: NextRequest) {
  // TODO: Add Supabase Auth session check
  // For now, allow all requests during development
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
