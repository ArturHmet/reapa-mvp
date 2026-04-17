import type { Metadata } from 'next';
import Link from 'next/link';

const POST_SLUG = 'inside-reapa-ai-copilot';
const CANONICAL = `https://reapa-mvp.vercel.app/blog/${POST_SLUG}`;

export const metadata: Metadata = {
  title: 'Inside the REAPA AI Copilot: How It Actually Works | REAPA Blog',
  description:
    'A deep dive into the REAPA AI real estate assistant — Gemini 2.5 Flash, SSE streaming, multilingual NLP pipeline, and why domain context beats generic AI for real estate agents.',
  keywords: [
    'AI real estate assistant',
    'real estate AI chatbot',
    'multilingual property AI',
    'AI property assistant Malta',
    'Gemini 2.5 Flash real estate',
    'REAPA Copilot',
  ],
  authors: [{ name: 'REAPA Team' }],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Inside the REAPA AI Copilot: How It Actually Works',
    description:
      'How REAPA built an AI real estate assistant that understands Malta\'s property market, handles Russian/English/Spanish buyers, and delivers sub-2s responses.',
    url: CANONICAL,
    siteName: 'REAPA',
    locale: 'en_MT',
    type: 'article',
    publishedTime: '2026-04-19T00:00:00+02:00',
    images: [
      {
        url: 'https://reapa-mvp.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'REAPA AI Copilot — Inside the AI real estate assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inside the REAPA AI Copilot: How It Actually Works',
    description:
      'Gemini 2.5 Flash + SSE streaming + multilingual NLP. A look under the hood of the REAPA AI real estate assistant.',
    images: ['https://reapa-mvp.vercel.app/og-image.png'],
  },
};

export default function BlogPostInsideREAPACopilot() {
  return (
    <main className="min-h-screen bg-[#0d0d28] text-gray-100">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white">
            🏠 REAPA
          </Link>
          <Link
            href="/#waitlist"
            className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition-colors"
          >
            Join Waitlist
          </Link>
        </div>
      </nav>

      {/* ── Article ─────────────────────────────────────────────────────── */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Meta */}
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Product · April 19, 2026
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight text-white">
            Inside the REAPA AI Copilot: How It Actually Works
          </h1>
          <p className="mt-4 text-lg text-gray-300 leading-relaxed">
            Most real estate AI tools are wrappers. They take a general-purpose language model, put
            a thin layer on top, and call it a property assistant. The result is a chatbot that can
            talk about real estate the way someone who has <em>read about</em> real estate can talk
            about it — without actually understanding it. REAPA&apos;s{' '}
            <strong>AI real estate assistant</strong> is built differently. This is a look under the
            hood.
          </p>
        </div>

        <hr className="border-gray-700 my-8" />

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            The Core Problem With Generic AI for Real Estate
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            A buyer sends a message: <em>&ldquo;Looking for something in the north, 2 bed, budget
            around 350.&rdquo;</em> A general-purpose AI will respond with something reasonable.
            But it will not know that &ldquo;the north&rdquo; in Malta means Mellieħa or St
            Paul&apos;s Bay, not Sliema. It will not know to ask about AIP permit eligibility for
            the non-EU buyer sending the message in Russian.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Domain context is not a nice-to-have. It is the difference between a useful{' '}
            <strong>AI real estate assistant</strong> and a frustrating one.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Gemini 2.5 Flash: Why This Model
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The REAPA AI Copilot runs on Gemini 2.5 Flash. Three reasons:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>
              <strong className="text-white">Speed</strong> — Sub-2-second response latency, the
              threshold at which users perceive a conversational interaction rather than a bot.
            </li>
            <li>
              <strong className="text-white">Reasoning</strong> — Genuine reasoning capability for
              inferring implicit requirements (&ldquo;quiet but close to amenities&rdquo; requires
              trade-off reasoning, not keyword matching).
            </li>
            <li>
              <strong className="text-white">Multilingual comprehension</strong> — True cross-lingual
              understanding, including code-switching mid-conversation.
            </li>
          </ol>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Server-Sent Events: Real-Time Streaming
          </h2>
          <p className="text-gray-300 leading-relaxed">
            REAPA uses SSE streaming via the Vercel AI SDK&apos;s{' '}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-indigo-300 text-sm">
              streamText
            </code>{' '}
            function. Text appears word by word within 200–400 ms of the request. Users experience
            the interaction as responsive and alive — not waiting for a spinner.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">
            The Multilingual NLP Pipeline
          </h2>

          <h3 className="text-lg font-semibold text-indigo-300 mb-3">
            Intent Classification — 7 Categories
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300 mb-6">
            {[
              'Property search',
              'Price enquiry',
              'Viewing request',
              'Listing information',
              'Compliance question',
              'General enquiry',
              'Follow-up',
            ].map((intent) => (
              <li key={intent}>{intent}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-indigo-300 mb-3">
            Entity Extraction — Structured Fields Across 10 Languages
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300 mb-6">
            {[
              'Location preferences',
              'Property type',
              'Budget range',
              'Timeline',
              'Buyer type (EU / non-EU)',
              'Language preference',
            ].map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-indigo-300 mb-3">
            Conversation Context Persistence
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Full conversation thread and entity state persisted across sessions. A buyer who goes
            quiet for 10 days re-engages to a <em>continued</em>, not restarted, conversation.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Real-World Example
          </h2>
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 mb-4">
            <p className="text-sm text-gray-400 mb-2">11:47 pm Malta — buyer in Dubai</p>
            <p className="text-gray-200 italic leading-relaxed">
              &ldquo;Интересуют апартаменты в Слиме, 2 спальни, бюджет до 400 тысяч. Гражданин
              России, нужна ли AIP?&rdquo;
            </p>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Within 1.4 seconds, REAPA responds in Russian: confirms Sliema 2-bed €400K, answers the
            AIP question accurately, asks two qualification follow-ups (investment or own-use?
            timeline?), and offers to send matching listings.
          </p>
          <p className="mt-3 text-gray-300 leading-relaxed">
            The agent wakes up to a qualified lead in their dashboard. The conversation has already
            progressed past initial enquiry.
          </p>
        </section>

        {/* Section 6 — Status table */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">Current Status</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold">Feature</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-gray-300">
                {[
                  ['Languages live', 'EN, RU, ES'],
                  ['Languages coming', 'AR, FR, DE, PT, ZH, TR, HI'],
                  ['Response latency', 'Sub-2 seconds'],
                  ['QA score', '100/100'],
                  ['CRM', 'Auto-save + lead-to-client conversion'],
                  ['Deployment', 'Vercel + Supabase + Google AI SDK'],
                ].map(([feature, status]) => (
                  <tr key={feature} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{feature}</td>
                    <td className="px-4 py-3 text-indigo-300">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            <strong className="text-gray-300">Coming next:</strong> Viewing booking, WhatsApp
            routing, listing database connection, analytics dashboard.
          </p>
        </section>

        <hr className="border-gray-700 my-10" />

        {/* CTA */}
        <section className="text-center py-10 px-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-700/40 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-3">
            Try the REAPA AI Real Estate Assistant
          </h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            The REAPA AI Copilot is in closed beta. Join the waitlist to be among the first agents
            to use it.
          </p>
          <a
            href="https://reapa-mvp.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-base"
          >
            Try REAPA Free →
          </a>
          <p className="mt-4 text-xs text-gray-500">
            No credit card required · Beta access · Malta &amp; EU agents
          </p>
        </section>
      </article>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800 px-6 py-8 mt-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© 2026 REAPA. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
