import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "REAPA Blog — AI Insights for Real Estate Agents",
  description:
    "Expert articles on AI automation, AML compliance, and productivity for Malta real estate agents.",
  openGraph: {
    title: "REAPA Blog — AI Insights for Real Estate Agents",
    description:
      "Expert articles on AI automation, AML compliance, and productivity for Malta real estate agents.",
    url: "https://reapa-mvp.vercel.app/blog",
    siteName: "REAPA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REAPA Blog — AI Insights for Real Estate Agents",
    description:
      "Expert articles on AI automation, AML compliance, and productivity for Malta real estate agents.",
  },
  alternates: {
    canonical: "https://reapa-mvp.vercel.app/blog",
  },
};

const categoryColors: Record<string, string> = {
  education: "bg-blue-900/40 text-blue-300 border border-blue-700/50",
  "market-update":
    "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50",
  feature: "bg-violet-900/40 text-violet-300 border border-violet-700/50",
};

const categoryLabels: Record<string, string> = {
  education: "Education",
  "market-update": "Market Update",
  feature: "Feature",
};

export default function BlogPage() {
  const posts = getAllPosts();

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "REAPA Blog",
    description: "AI insights for Malta real estate agents",
    url: "https://reapa-mvp.vercel.app/blog",
    publisher: {
      "@type": "Organization",
      name: "REAPA",
      url: "https://reapa-mvp.vercel.app",
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `https://reapa-mvp.vercel.app/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <Link href="/" className="inline-block mb-8">
              <span className="text-slate-400 hover:text-slate-200 transition-colors text-sm">
                ← Back to REAPA
              </span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              REAPA Blog
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              AI insights, market updates, and compliance guides for Malta real estate agents.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-slate-500">No posts yet.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <article className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          categoryColors[post.category] || categoryColors.education
                        }`}
                      >
                        {categoryLabels[post.category] || post.category}
                      </span>
                      <time
                        className="text-sm text-slate-500"
                        dateTime={post.date}
                      >
                        {new Date(post.date).toLocaleDateString("en-MT", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                      <span className="text-sm text-slate-600">·</span>
                      <span className="text-sm text-slate-500">
                        {post.readingTime}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-slate-200 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                      {post.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                      Read article
                      <svg
                        className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
