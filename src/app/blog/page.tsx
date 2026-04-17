import type {Metadata} from "next";
import Link from "next/link";
import {getAllPosts} from "@/content/blog/posts";
import {Calendar, Clock, ArrowRight, Rss} from "lucide-react";

export const metadata: Metadata = {
  title: "Blog \u2014 REAPA | AI Tools for Real Estate Agents",
  description:
    "Insights, tactics, and AI strategies for real estate agents. Learn how to automate admin, qualify leads faster, and close more deals.",
  openGraph: {
    title: "Blog \u2014 REAPA | AI Tools for Real Estate Agents",
    description: "Insights, tactics, and AI strategies for real estate agents.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Rss size={18} className="text-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-widest">
            REAPA Blog
          </span>
        </div>
        <h1 className="text-3xl font-bold">AI for Real Estate Agents</h1>
        <p className="text-[var(--text-muted)] max-w-xl">
          Tactics, tools, and AI strategies to automate admin and spend more
          time closing deals.
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)] transition-all duration-200"
          >
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-3">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(post.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {post.readTime} min read
              </span>
            </div>
            <h2 className="text-lg font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors leading-snug">
              {post.title}
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]">
              Read article
              <ArrowRight
                size={13}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-xl p-6 text-center space-y-3">
        <p className="font-semibold">Ready to reclaim your day?</p>
        <p className="text-sm text-[var(--text-muted)]">
          Join 100 founding agents getting REAPA at beta pricing \u2014 locked in forever.
        </p>
        <Link
          href="/waitlist"
          className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Join the waitlist \u2192
        </Link>
      </div>
    </div>
  );
}
