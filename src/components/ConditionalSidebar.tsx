"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

// Auth pages — sidebar is hidden on these routes
const AUTH_ROUTES = ["/login", "/signup"];

export function ConditionalSidebar() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname)) return null;
  return <Sidebar />;
}
