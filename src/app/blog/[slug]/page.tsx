import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/content/blog/posts";
import { Calendar, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { marked } from "marked";

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

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
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
        <p className="text-sm text-[var(--text-muted)]">
          REAPA handles all five tasks \u2014 10 languages, 24/7. Join the founding 100 agents before beta pricing closes.
        </p>
        <Link
          href="/waitlist"
          className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Join waitlist <ExternalLink size={13} />
        </Link>
      </div>

      <div className="border-t border-[var(--border)] pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to all articles
        </Link>
      </div>
    </div>
  );
}
