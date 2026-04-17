import { describe, it, expect } from "vitest";

// Pure helper extracted from middleware RBAC logic (ADMIN-RBAC-001)
function isAdminUser(
  userMetadata?: Record<string, unknown>,
  email?: string,
  adminEmails: string[] = [],
): boolean {
  return (
    userMetadata?.role === "admin" ||
    adminEmails.includes((email ?? "").toLowerCase())
  );
}

describe("ADMIN-RBAC-001 — isAdminUser()", () => {
  it("allows user with role=admin in metadata", () => {
    expect(isAdminUser({ role: "admin" }, "any@example.com", [])).toBe(true);
  });
  it("allows user whose email is in ADMIN_EMAILS allowlist", () => {
    expect(isAdminUser({}, "artur@reapa.ai", ["artur@reapa.ai"])).toBe(true);
  });
  it("blocks authenticated user with no role and not in allowlist", () => {
    expect(isAdminUser({ full_name: "Beta User" }, "beta@example.com", ["artur@reapa.ai"])).toBe(false);
  });
  it("blocks user with undefined metadata", () => {
    expect(isAdminUser(undefined, "someone@example.com", [])).toBe(false);
  });
  it("is case-insensitive for email allowlist matching", () => {
    expect(isAdminUser({}, "ARTUR@REAPA.AI", ["artur@reapa.ai"])).toBe(true);
  });
  it("blocks user with role=user (not admin)", () => {
    expect(isAdminUser({ role: "user" }, "user@example.com", [])).toBe(false);
  });
});
