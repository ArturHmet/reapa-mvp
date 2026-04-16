import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-3xl font-bold text-white mb-3">404 — Page not found</h1>
      <p className="text-gray-400 mb-8 max-w-md">This page does not exist or has been moved.</p>
      <Link href="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}
