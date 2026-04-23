import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: `${post.title} | REAPA Blog`,
    description: post.description,
    keywords: [post.keyword, "Malta real estate", "REAPA"],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://reapa-mvp.vercel.app/blog/${slug}`,
      siteName: "REAPA",
      type: "article",
      publishedTime: post.date,
      images: [
        {
          url: `https://reapa-mvp.vercel.app/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://reapa-mvp.vercel.app/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "REAPA",
      url: "https://reapa-mvp.vercel.app",
    },
    publisher: {
      "@type": "Organization",
      name: "REAPA",
      url: "https://reapa-mvp.vercel.app",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://reapa-mvp.vercel.app/blog/${slug}`,
    },
    keywords: post.keyword,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors mb-10"
          >
            <svg
              className="mr-1.5 w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>

          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {post.category}
              </span>
              <time className="text-sm text-slate-500" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-MT", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="text-sm text-slate-600">·</span>
              <span className="text-sm text-slate-500">{post.readingTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-slate-400">{post.description}</p>
          </header>

          <article className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-200 prose-li:text-slate-300 prose-code:text-slate-200 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-slate-600 prose-blockquote:text-slate-400">
            <MDXRemote source={post.content} />
          </article>

          <div className="mt-16 p-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to automate your real estate business?
            </h3>
            <p className="text-slate-400 mb-6">
              Join Malta&apos;s most forward-thinking agents on the REAPA waitlist.
            </p>
            <a
              href="https://reapa-mvp.vercel.app"
              className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Join the REAPA waitlist →
            </a>
          </div>

          {(prevPost || nextPost) && (
            <nav className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              {prevPost && (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-all"
                >
                  <div className="text-xs text-slate-500 mb-1.5">← Previous</div>
                  <div className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    {prevPost.title}
                  </div>
                </Link>
              )}
              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-all md:text-right"
                >
                  <div className="text-xs text-slate-500 mb-1.5">Next →</div>
                  <div className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    {nextPost.title}
                  </div>
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
    </>
  );
}
