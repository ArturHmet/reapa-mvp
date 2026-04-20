import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Link from "next/link";
import {getPostBySlug, getAllPosts} from "@/content/blog/posts";
import {Calendar, Clock, ArrowLeft, ArrowRight, ExternalLink} from "lucide-react";
import {marked} from "marked";

// BUG-041: hard-404 any slug not in generateStaticParams — prevents soft-404 SEO risk
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    openGraph: { 
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.date,
    },
    keywords: [post.targetKeyword],
    robots: { index: true, follow: true },
    twitter: { card: "summary_large_image", title: post.metaTitle },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  marked.setOptions({ breaks: false });
  const htmlContent = await marked(post.content);

  // Related posts: all posts except current, max 2
  const relatedPosts = getAllPosts().filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="max-w-3Xl mx-auto py-4 space-y-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-[var(-zmtext-muted)] hover:text-[var(--text)] transition-colors"
      >
        <ArrowLeft size={14} />
        All articles
      </Link>

      <div className="space-y-4">
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
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
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          {post.title}
        </h1>
        <p className="text-[var(--text-muted)] text-base leading-relaxed">
          {post.excerpt}
        </p>
        <div className="border-b border-[var(--border)]" />
      </div>

      <article
        className="prose-reapa"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-xl p-6 space-y-3">
        <p className="font-semibold text-lg">Stop doing work a machine can do better.</p>
        <p className="text-sm text-[var(-zltext-muted)]">
          REAPA handles all five tasks &#8214; 10 languages, 24/7. Join the founding 100 agents before beta pricing closes.
        </p>
        <Link
          href="/waitlist"
          className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Join the waitlist &#8594;
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* ── Related Posts ─────────────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-[var(--border)] pt-8 space-y-4">
          <h2 className="text-lg font-semibold">Related Articles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card-hover)] transition-all duration-200"
              >
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-2">
                  <Calendar size={11} />
                  {new Date(related.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {related.readTime} min
                  </span>
                </div>
                <h3 className="text-sm font-semibold leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                  {related.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-[var(--accent)] mt-2">
                  Read <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
