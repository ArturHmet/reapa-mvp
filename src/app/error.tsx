"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[REAPA Error]", error); }, [error]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="text-5xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
      <p className="text-gray-400 mb-2 max-w-md">{error.message ?? "An unexpected error occurred."}</p>
      {error.digest && <p className="text-xs text-gray-600 mb-6 font-mono">ID: {error.digest}</p>}
      <button onClick={reset} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
        Try again
      </button>
    </div>
  );
}
