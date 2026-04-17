"use client";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, AlertTriangle, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete account");
      // Sign out and redirect
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
      router.push("/?deleted=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
      </div>

      {/* Profile section placeholder */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Profile</h2>
        <p className="text-sm text-gray-400 mb-4">
          Manage your account details and preferences.
        </p>
        <p className="text-xs text-gray-500">
          Profile editing coming soon. Contact{" "}
          <a href="mailto:support@reapa.ai" className="text-indigo-400 underline">
            support@reapa.ai
          </a>{" "}
          to update your account details.
        </p>
      </div>

      {/* Legal links */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Legal</h2>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="text-indigo-400 underline hover:text-indigo-300">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-indigo-400 underline hover:text-indigo-300">
            Terms of Service
          </Link>
        </div>
      </div>

      {/* Danger zone — GDPR Art. 17 Right to Erasure */}
      <div className="bg-red-950/30 border border-red-800/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-1 flex items-center gap-2">
          <Trash2 size={18} />
          Danger Zone
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Permanently delete your account and all associated data (leads, clients, tasks,
          messages). This action cannot be undone and satisfies your right to erasure
          under GDPR Article 17.
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete My Account
          </button>
        ) : (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={20} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-300">
                  Are you absolutely sure?
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  This will permanently delete your REAPA account and all your data —
                  leads, clients, tasks, and conversation history. This cannot be reversed.
                </p>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-300 bg-red-900/50 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {isDeleting ? "Deleting…" : "Yes, delete permanently"}
              </button>
              <button
                onClick={() => { setShowConfirm(false); setError(null); }}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
