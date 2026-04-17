import Link from "next/link";

/**
 * UX-BETA-003: Standalone 403 Forbidden page.
 * Rendered when middleware (ADMIN-RBAC-001) redirects non-admin users from /admin.
 * Mirrors the inline access-denied UI in admin/layout.tsx (defense-in-depth layer).
 */
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
      <div className="flex flex-col items-center justify-center text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Restricted</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          This area is for the REAPA team only. If you believe this is an error,
          contact{" "}
          <a href="mailto:hello@reapa.ai" className="text-indigo-400 hover:underline">
            hello@reapa.ai
          </a>
          .
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
